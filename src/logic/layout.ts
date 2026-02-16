import type { ASTNode } from './ast';
import type { Node, Edge } from 'reactflow';
import { 
  AndGate,
  OrGate,
  NotGate,
  XorGate,
  NandGate,
  NorGate,
  XnorGate
} from '../components/LogicGateSymbols';

const NODE_HEIGHT = 80;

const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 100;

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

export const astToGraph = (ast: ASTNode): { nodes: Node[]; edges: Edge[] } => {
  const simplifiedAST = preprocessASTForDiagram(ast);
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

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
  
  varNodes.forEach((varName, index) => {
    const id = `input-${varName}`;
    varMap[varName] = id;
    nodes.push({
      id,
      type: 'inputNode',
      position: { x: 0, y: index * (NODE_HEIGHT + VERTICAL_SPACING) },
      data: { label: varName }
    });
  });

  const traverse = (node: ASTNode, x: number, y: number): { id: string; height: number } => {
    if (node.type === 'VAR' && node.name) {
      const id = varMap[node.name];
      return { id, height: NODE_HEIGHT };
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

    let childY = y;
    let totalChildrenHeight = 0;
    
    node.children.forEach((child, index) => {
      // Find the depth to decide X of gates
      const childResult = traverse(child, x - HORIZONTAL_SPACING, childY);
      edges.push({
        id: `edge-${currentId}-${childResult.id}-${index}`,
        source: childResult.id,
        target: currentId,
        animated: true,
        style: { stroke: '#94a3b8' }
      });
      childY += childResult.height + VERTICAL_SPACING;
      totalChildrenHeight += childResult.height + (index > 0 ? VERTICAL_SPACING : 0);
    });

    const finalY = y + (totalChildrenHeight / 2) - (NODE_HEIGHT / 2);
    
    nodes.push({
      id: currentId,
      type: 'gateNode',
      position: { x, y: finalY },
      data
    });

    return { id: currentId, height: Math.max(NODE_HEIGHT, totalChildrenHeight) };
  };

  // Calculate necessary horizontal space based on AST depth
  const getDepth = (node: ASTNode): number => {
    if (node.type === 'VAR') return 1;
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getDepth));
  };
  const depth = getDepth(simplifiedAST);
  const startX = depth * HORIZONTAL_SPACING;

  const root = traverse(simplifiedAST, startX, 100);
  
  // Add Output node
  const outputId = 'output-node';
  nodes.push({
    id: outputId,
    type: 'outputNode',
    position: { x: startX + HORIZONTAL_SPACING, y: nodes.find(n => n.id === root.id)?.position.y || 100 },
    data: { label: 'OUT' }
  });
  
  edges.push({
    id: `edge-${outputId}-${root.id}`,
    source: root.id,
    target: outputId,
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  });

  return { nodes, edges };
};
