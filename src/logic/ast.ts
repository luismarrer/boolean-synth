export type NodeType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'XNOR' | 'NAND' | 'NOR' | 'VAR';

export interface ASTNode {
  type: NodeType;
  name?: string; // For VAR
  children: ASTNode[];
}

export interface StringifyOptions {
  expanded?: boolean;
}

export const getVariables = (node: ASTNode): string[] => {
  const vars = new Set<string>();
  const collect = (n: ASTNode) => {
    if (n.type === 'VAR' && n.name && !['0', '1'].includes(n.name)) vars.add(n.name);
    n.children.forEach(collect);
  };
  collect(node);
  return Array.from(vars).sort();
};

export const evaluateAST = (node: ASTNode, values: Record<string, boolean>): boolean => {
  switch (node.type) {
    case 'VAR':
      if (node.name === '1') return true;
      if (node.name === '0') return false;
      return !!values[node.name!];
    case 'NOT': return !evaluateAST(node.children[0], values);
    case 'AND': return node.children.every(c => evaluateAST(c, values));
    case 'OR': return node.children.some(c => evaluateAST(c, values));
    case 'XOR': return node.children.reduce((acc, c) => acc !== evaluateAST(c, values), false);
    case 'XNOR': return !node.children.reduce((acc, c) => acc !== evaluateAST(c, values), false);
    case 'NAND': return !node.children.every(c => evaluateAST(c, values));
    case 'NOR': return !node.children.some(c => evaluateAST(c, values));
    default: return false;
  }
};

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

export interface TruthTableRow {
  values: Record<string, boolean>;
  result: boolean;
}

export const generateTruthTable = (node: ASTNode): { variables: string[], rows: TruthTableRow[] } => {
  const variables = getVariables(node);
  const rows: TruthTableRow[] = [];
  const numRows = 1 << variables.length;

  for (let i = 0; i < numRows; i++) {
    const values: Record<string, boolean> = {};
    variables.forEach((v, idx) => {
      values[v] = !!(i & (1 << (variables.length - 1 - idx)));
    });
    rows.push({
      values,
      result: evaluateAST(node, values)
    });
  }

  return { variables, rows };
};
