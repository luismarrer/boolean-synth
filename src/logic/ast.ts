export type NodeType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'XNOR' | 'NAND' | 'NOR' | 'VAR';

export interface ASTNode {
  type: NodeType;
  name?: string; // For VAR
  children: ASTNode[];
}

export interface StringifyOptions {
  expanded?: boolean;
}

export const stringifyAST = (node: ASTNode, options: StringifyOptions = {}): string => {
  const { expanded } = options;

  const getPrecedence = (type: NodeType): number => {
    switch (type) {
      case 'VAR': return 4;
      case 'NOT': return 3;
      case 'AND': return 2;
      case 'NAND': return 2;
      case 'OR': return 1;
      case 'NOR': return 1;
      case 'XOR': return 1;
      case 'XNOR': return 1;
      default: return 0;
    }
  };

  // Improved recursive stringifier
  const format = (n: ASTNode, parentPrecedence: number = 0): string => {
    const wrap = (val: string, needsWrap: boolean) => needsWrap ? `(${val})` : val;

    switch (n.type) {
      case 'VAR':
        return n.name || '';
      case 'NOT': {
        const child = n.children[0];
        const childStr = format(child, 3);
        const needsParens = getPrecedence(child.type) < 3;
        return `${wrap(childStr, needsParens)}'`;
      }
      case 'AND': {
        const content = n.children.map(c => format(c, 2)).join('');
        return wrap(content, parentPrecedence > 2);
      }
      case 'OR': {
        const content = n.children.map(c => format(c, 1)).join('+');
        return wrap(content, parentPrecedence > 1);
      }
      case 'XOR':
        if (expanded && n.children.length === 2) {
          const a = format(n.children[0], 2);
          const b = format(n.children[1], 2);
          const na = format({ type: 'NOT', children: [n.children[0]] }, 2);
          const nb = format({ type: 'NOT', children: [n.children[1]] }, 2);
          const content = `${na}${b}+${a}${nb}`;
          return wrap(content, parentPrecedence > 1);
        }
        return wrap(n.children.map(c => format(c, 1)).join('^'), parentPrecedence > 1);
      case 'XNOR':
        if (expanded && n.children.length === 2) {
          const a = format(n.children[0], 2);
          const b = format(n.children[1], 2);
          const na = format({ type: 'NOT', children: [n.children[0]] }, 2);
          const nb = format({ type: 'NOT', children: [n.children[1]] }, 2);
          const content = `${a}${b}+${na}${nb}`;
          return wrap(content, parentPrecedence > 1);
        }
        return wrap(n.children.map(c => format(c, 1)).join('⊙'), parentPrecedence > 1);
      case 'NAND':
        if (expanded) {
          const content = n.children.map(c => format({ type: 'NOT', children: [c] }, 1)).join('+');
          return wrap(content, parentPrecedence > 1);
        }
        return wrap(n.children.map(c => format(c, 2)).join(''), true) + "'";
      case 'NOR':
        if (expanded) {
          const content = n.children.map(c => format({ type: 'NOT', children: [c] }, 2)).join('');
          return wrap(content, parentPrecedence > 2);
        }
        return wrap(n.children.map(c => format(c, 1)).join('+'), true) + "'";
      default:
        return '';
    }
  };

  return format(node);
};
