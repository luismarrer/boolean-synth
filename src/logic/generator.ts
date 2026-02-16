import type { Node, Edge } from 'reactflow';
import type { ASTNode, NodeType } from './ast';

export const graphToAST = (nodes: Node[], edges: Edge[]): ASTNode => {
  const outputNode = nodes.find(n => n.type === 'outputNode');
  if (!outputNode) throw new Error("No output node found");

  const buildAST = (nodeId: string): ASTNode => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);

    if (node.type === 'inputNode') {
      return { type: 'VAR', name: node.data.label, children: [] };
    }

    // Find children (nodes that point to this node)
    const incomingEdges = edges.filter(e => e.target === nodeId);
    const children = incomingEdges.map(e => buildAST(e.source));

    let type: NodeType = node.data.label as NodeType;
    
    return { type, children };
  };

  const rootEdge = edges.find(e => e.target === outputNode.id);
  if (!rootEdge) throw new Error("Output node not connected");

  return buildAST(rootEdge.source);
};
