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
    
    // Validate children counts for certain gates
    if (type === 'NOT' && children.length !== 1) {
        // Return a partial AST or throw to avoid broken expressions
        throw new Error("NOT gate must have exactly one input");
    }
    if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'].includes(type) && children.length < 2) {
        // Instead of throwing, we can return the children directly if only one, 
        // or just let it be if we want the expression to update as they build it.
        // But for NAND/NOR it's better to have at least two.
    }
    
    return { type, children };
  };

  const rootEdge = edges.find(e => e.target === outputNode.id);
  if (!rootEdge) return { type: 'VAR', name: '?', children: [] }; // Return placeholder if not connected

  try {
    return buildAST(rootEdge.source);
  } catch (e) {
    return { type: 'VAR', name: '...', children: [] };
  }
};
