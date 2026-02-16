export type NodeType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'XNOR' | 'NAND' | 'NOR' | 'VAR';

export interface ASTNode {
  type: NodeType;
  name?: string; // For VAR
  children: ASTNode[];
}

export const stringifyAST = (node: ASTNode): string => {
  switch (node.type) {
    case 'VAR':
      return node.name || '';
    case 'NOT':
      return `(${stringifyAST(node.children[0])})'`;
    case 'AND':
      return `(${node.children.map(stringifyAST).join('')})`;
    case 'OR':
      return `(${node.children.map(stringifyAST).join('+')})`;
    case 'XOR':
      return `(${node.children.map(stringifyAST).join('^')})`;
    case 'XNOR':
      return `(${node.children.map(stringifyAST).join('⊙')})`;
    case 'NAND':
      return `(${node.children.map(stringifyAST).join('⊼')})`;
    case 'NOR':
      return `(${node.children.map(stringifyAST).join('⊽')})`;
    default:
      return '';
  }
};
