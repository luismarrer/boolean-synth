import type { ASTNode } from './ast';
import type { Node, Edge } from 'reactflow';
import { 
  Plus, 
  CircleDot, 
  CircleSlash, 
  SquareAsterisk, 
  Zap, 
  ZapOff,
  CircleHelp
} from 'lucide-react';

const NODE_HEIGHT = 80;

const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 100;

export const astToGraph = (ast: ASTNode): { nodes: Node[]; edges: Edge[] } => {
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
  collectVars(ast);

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
      case 'AND': data.icon = SquareAsterisk; data.color = '#3b82f6'; break;
      case 'OR': data.icon = Plus; data.color = '#10b981'; break;
      case 'NOT': data.icon = CircleSlash; data.color = '#ef4444'; break;
      case 'XOR': data.icon = Zap; data.color = '#f59e0b'; break;
      case 'XNOR': data.icon = ZapOff; data.color = '#8b5cf6'; break;
      case 'NAND': data.icon = CircleDot; data.color = '#06b6d4'; break;
      case 'NOR': data.icon = CircleHelp; data.color = '#ec4899'; break;
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
  const depth = getDepth(ast);
  const startX = depth * HORIZONTAL_SPACING;

  const root = traverse(ast, startX, 100);
  
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
