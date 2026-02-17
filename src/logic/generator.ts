import type { Node, Edge } from 'reactflow';
import type { ASTNode, NodeType } from './ast';

export const buildNodeAST = (nodeId: string, nodes: Node[], edges: Edge[]): ASTNode => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) throw new Error(`Node ${nodeId} not found`);

  if (node.type === 'inputNode') {
    return { type: 'VAR', name: node.data.label.toLowerCase(), children: [] };
  }

  // Find children (nodes that point to this node)
  const incomingEdges = edges.filter(e => e.target === nodeId);
  const children = incomingEdges.map(e => buildNodeAST(e.source, nodes, edges));

  let type: NodeType = node.data.label as NodeType;

  // Validate children counts for certain gates
  if (type === 'NOT' && children.length !== 1) {
    throw new Error("NOT gate must have exactly one input");
  }

  return { type, children };
};

export const graphToAST = (nodes: Node[], edges: Edge[]): ASTNode => {
  const outputNode = nodes.find(n => n.type === 'outputNode');
  if (!outputNode) throw new Error("No output node found");

  const rootEdge = edges.find(e => e.target === outputNode.id);
  if (!rootEdge) return { type: 'VAR', name: '?', children: [] }; // Return placeholder if not connected

  try {
    return buildNodeAST(rootEdge.source, nodes, edges);
  } catch (e) {
    return { type: 'VAR', name: '...', children: [] };
  }
};
