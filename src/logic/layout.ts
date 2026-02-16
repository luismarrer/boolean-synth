import type { ASTNode } from './ast';
import type { Node, Edge } from 'reactflow';
import { 
  Plus, 
  CircleDot, 
  CircleSlash, 
  SquareAsterisk, 
  Zap, 
  ZapOff,
  CircleHelp,
  Type
} from 'lucide-react';

const NODE_WIDTH = 150;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 200;
const VERTICAL_SPACING = 100;

export const astToGraph = (ast: ASTNode): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let idCounter = 0;

  const traverse = (node: ASTNode, x: number, y: number, parentId?: string): { id: string; height: number } => {
    const currentId = `node-${idCounter++}`;
    let height = 0;

    const data: any = { label: node.type };
    let type = 'gate';
    
    switch (node.type) {
      case 'AND': data.icon = SquareAsterisk; data.color = '#3b82f6'; break;
      case 'OR': data.icon = Plus; data.color = '#10b981'; break;
      case 'NOT': data.icon = CircleSlash; data.color = '#ef4444'; break;
      case 'XOR': data.icon = Zap; data.color = '#f59e0b'; break;
      case 'XNOR': data.icon = ZapOff; data.color = '#8b5cf6'; break;
      case 'NAND': data.icon = CircleDot; data.color = '#06b6d4'; break;
      case 'NOR': data.icon = CircleHelp; data.color = '#ec4899'; break;
      case 'VAR':
        type = 'input';
        data.label = node.name;
        break;
    }

    if (node.type === 'VAR') {
      nodes.push({
        id: currentId,
        type: 'inputNode',
        position: { x, y },
        data: { label: node.name }
      });
      return { id: currentId, height: NODE_HEIGHT };
    }

    let childY = y;
    let totalChildrenHeight = 0;
    
    node.children.forEach((child, index) => {
      const childResult = traverse(child, x - HORIZONTAL_SPACING, childY, currentId);
      edges.push({
        id: `edge-${currentId}-${childResult.id}`,
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

  const root = traverse(ast, 800, 300);
  
  // Add Output node
  const outputId = 'output-node';
  nodes.push({
    id: outputId,
    type: 'outputNode',
    position: { x: 800 + HORIZONTAL_SPACING, y: 300 },
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
