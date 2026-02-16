import type { ASTNode } from './ast';

/**
 * Basic boolean simplifier using truth tables for a small number of variables.
 * It will try to find a simpler expression for the given AST.
 */

const getVariables = (node: ASTNode): string[] => {
  const vars = new Set<string>();
  const collect = (n: ASTNode) => {
    if (n.type === 'VAR' && n.name) vars.add(n.name);
    n.children.forEach(collect);
  };
  collect(node);
  return Array.from(vars).sort();
};

const evaluate = (node: ASTNode, values: Record<string, boolean>): boolean => {
  switch (node.type) {
    case 'VAR': return !!values[node.name!];
    case 'NOT': return !evaluate(node.children[0], values);
    case 'AND': return node.children.every(c => evaluate(c, values));
    case 'OR': return node.children.some(c => evaluate(c, values));
    case 'XOR': return node.children.reduce((acc, c) => acc !== evaluate(c, values), false);
    case 'XNOR': return !node.children.reduce((acc, c) => acc !== evaluate(c, values), false);
    case 'NAND': return !node.children.every(c => evaluate(c, values));
    case 'NOR': return !node.children.some(c => evaluate(c, values));
    default: return false;
  }
};

export const simplifyAST = (node: ASTNode): ASTNode => {
  const vars = getVariables(node);
  if (vars.length > 8) return node; // Too many variables for truth table

  const table: boolean[] = [];
  const numRows = 1 << vars.length;

  for (let i = 0; i < numRows; i++) {
    const values: Record<string, boolean> = {};
    vars.forEach((v, idx) => {
      values[v] = !!(i & (1 << (vars.length - 1 - idx)));
    });
    table.push(evaluate(node, values));
  }

  // Check for constants
  if (table.every(v => v === true)) return { type: 'VAR', name: '1', children: [] };
  if (table.every(v => v === false)) return { type: 'VAR', name: '0', children: [] };

  // For now, let's just return the original node if we don't have a sophisticated minimizer.
  // But we can check for simple cases like single variable or its negation.
  
  // Check if it's just a single variable
  for (const v of vars) {
    const isVar = table.every((val, i) => {
      const bit = !!(i & (1 << (vars.length - 1 - vars.indexOf(v))));
      return val === bit;
    });
    if (isVar) return { type: 'VAR', name: v, children: [] };

    const isNotVar = table.every((val, i) => {
      const bit = !!(i & (1 << (vars.length - 1 - vars.indexOf(v))));
      return val === !bit;
    });
    if (isNotVar) return { type: 'NOT', children: [{ type: 'VAR', name: v, children: [] }] };
  }

  // Check for XOR/XNOR of 2 variables
  if (vars.length === 2) {
    const [a, b] = vars;
    const xorTable = [false, true, true, false];
    const xnorTable = [true, false, false, true];

    if (table.every((val, i) => val === xorTable[i])) {
      return { 
        type: 'XOR', 
        children: [
          { type: 'VAR', name: a, children: [] },
          { type: 'VAR', name: b, children: [] }
        ] 
      };
    }
    if (table.every((val, i) => val === xnorTable[i])) {
      return { 
        type: 'XNOR', 
        children: [
          { type: 'VAR', name: a, children: [] },
          { type: 'VAR', name: b, children: [] }
        ] 
      };
    }
  }

  return node;
};
