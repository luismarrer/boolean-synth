import type { ASTNode } from './ast';
import { Position, type Node, type Edge } from 'reactflow';
import { 
  AndGate,
  OrGate,
  NotGate,
  XorGate,
  NandGate,
  NorGate,
  XnorGate
} from '../components/LogicGateSymbols';


const preprocessASTForDiagram = (node: ASTNode): ASTNode => {
  // Recursively process children first
  const processedChildren = node.children.map(preprocessASTForDiagram);

  // Check for NOT(GATE) patterns
  if (node.type === 'NOT' && processedChildren.length === 1) {
    const child = processedChildren[0];
    if (child.type === 'AND') {
      return { type: 'NAND', children: child.children };
    }
    if (child.type === 'OR') {
      return { type: 'NOR', children: child.children };
    }
    if (child.type === 'XOR') {
      return { type: 'XNOR', children: child.children };
    }
  }

  // Check for XOR patterns: (a'b + ab')
  if (node.type === 'OR' && processedChildren.length === 2) {
    const [c1, c2] = processedChildren;
    if (c1.type === 'AND' && c2.type === 'AND' && c1.children.length === 2 && c2.children.length === 2) {
      const getVarAndNot = (andNode: ASTNode) => {
        const varNode = andNode.children.find(c => c.type === 'VAR');
        const notNode = andNode.children.find(c => c.type === 'NOT' && c.children[0].type === 'VAR');
        return { varName: varNode?.name, notVarName: notNode?.children[0].name };
      };

      const set1 = getVarAndNot(c1);
      const set2 = getVarAndNot(c2);

      // XOR: (a'b + ab') or (ab' + a'b)
      if (set1.varName && set1.notVarName && set2.varName && set2.notVarName) {
        if (set1.varName === set2.notVarName && set1.notVarName === set2.varName) {
          return { 
            type: 'XOR', 
            children: [
              { type: 'VAR', name: set1.varName, children: [] },
              { type: 'VAR', name: set1.notVarName, children: [] }
            ] 
          };
        }
      }

      // XNOR: (ab + a'b')
      const getTwoVars = (andNode: ASTNode) => {
        const vars = andNode.children.filter(c => c.type === 'VAR').map(v => v.name);
        return vars.length === 2 ? vars.sort() : null;
      };
      const getTwoNots = (andNode: ASTNode) => {
        const nots = andNode.children.filter(c => c.type === 'NOT' && c.children[0].type === 'VAR').map(v => v.children[0].name);
        return nots.length === 2 ? nots.sort() : null;
      };

      const vars1 = getTwoVars(c1);
      const nots1 = getTwoNots(c1);
      const vars2 = getTwoVars(c2);
      const nots2 = getTwoNots(c2);

      if ((vars1 && nots2 && vars1[0] === nots2[0] && vars1[1] === nots2[1]) ||
          (vars2 && nots1 && vars2[0] === nots1[0] && vars2[1] === nots1[1])) {
        const finalVars = vars1 || vars2;
        return {
          type: 'XNOR',
          children: [
            { type: 'VAR', name: finalVars![0], children: [] },
            { type: 'VAR', name: finalVars![1], children: [] }
          ]
        };
      }
    }
  }

  return { ...node, children: processedChildren };
};

import dagre from 'dagre';

export const astToGraph = (ast: ASTNode): { nodes: Node[]; edges: Edge[] } => {
  const simplifiedAST = preprocessASTForDiagram(ast);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // A directed graph moving from left to right
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 120 });

  // 1. Find all unique variables
  const variables = new Set<string>();
  const collectVars = (node: ASTNode) => {
    if (node.type === 'VAR' && node.name) {
      variables.add(node.name);
    }
    node.children.forEach(collectVars);
  };
  collectVars(simplifiedAST);

  // 2. Map variables to node IDs and create them
  const varNodes = Array.from(variables).sort();
  const varMap: Record<string, string> = {};
  
  varNodes.forEach((varName) => {
    const id = `input-${varName}`;
    varMap[varName] = id;
    nodes.push({
      id,
      type: 'inputNode',
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      data: { label: varName }
    });
    dagreGraph.setNode(id, { width: 60, height: 60 });
  });

  // 3. Traverse and collect gates and edges
  const traverse = (node: ASTNode): string => {
    if (node.type === 'VAR' && node.name) {
      return varMap[node.name];
    }

    const currentId = `node-${idCounter++}`;
    const data: any = { label: node.type };
    
    switch (node.type) {
      case 'AND': data.icon = AndGate; data.color = '#3b82f6'; break;
      case 'OR': data.icon = OrGate; data.color = '#10b981'; break;
      case 'NOT': data.icon = NotGate; data.color = '#ef4444'; break;
      case 'XOR': data.icon = XorGate; data.color = '#f59e0b'; break;
      case 'XNOR': data.icon = XnorGate; data.color = '#8b5cf6'; break;
      case 'NAND': data.icon = NandGate; data.color = '#06b6d4'; break;
      case 'NOR': data.icon = NorGate; data.color = '#ec4899'; break;
    }

    nodes.push({
      id: currentId,
      type: 'gateNode',
      position: { x: 0, y: 0 },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      data
    });
    dagreGraph.setNode(currentId, { width: 80, height: 80 });

    node.children.forEach((child, index) => {
      const childId = traverse(child);
      const edgeId = `edge-${currentId}-${childId}-${index}`;
      edges.push({
        id: edgeId,
        source: childId, // flowing from inputs to gates
        target: currentId,
        sourceHandle: 'source',
        targetHandle: 'target',
        animated: true,
        style: { stroke: '#94a3b8' }
      });
      dagreGraph.setEdge(childId, currentId);
    });

    return currentId;
  };

  const rootId = traverse(simplifiedAST);
  
  // Add Output node
  const outputId = 'output-node';
  nodes.push({
    id: outputId,
    type: 'outputNode',
    position: { x: 0, y: 0 },
    targetPosition: Position.Left,
    data: { label: 'OUT' }
  });
  dagreGraph.setNode(outputId, { width: 60, height: 60 });
  
  edges.push({
    id: `edge-${outputId}-${rootId}`,
    source: rootId,
    target: outputId,
    sourceHandle: 'source',
    targetHandle: 'target',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  });
  dagreGraph.setEdge(rootId, outputId);

  // Apply layout
  dagre.layout(dagreGraph);

  // Apply coordinates to regular nodes
  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - (nodeWithPosition.width / 2),
      y: nodeWithPosition.y - (nodeWithPosition.height / 2),
    };
  });

  return { nodes, edges };
};
