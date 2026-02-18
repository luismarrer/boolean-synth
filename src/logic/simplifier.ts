import type { ASTNode } from './ast';
import { getVariables, evaluateAST } from './ast';

/**
 * Basic boolean simplifier using truth tables for a small number of variables.
 * It will try to find a simpler expression for the given AST.
 */

const isNot = (node: ASTNode): boolean => node.type === 'NOT';
const getNotChild = (node: ASTNode): ASTNode => node.children[0];

/**
 * Performs structural simplifications:
 * - Double negation: (x')' -> x
 * - De Morgan: (a'b')' -> a+b
 * - De Morgan: (a'+b')' -> ab
 */
const simplifyStructural = (node: ASTNode): ASTNode => {
  // Recursively simplify children first
  const children = node.children.map(simplifyStructural);
  const newNode: ASTNode = { ...node, children };

  // Double negation elimination: (x')' -> x
  if (newNode.type === 'NOT' && isNot(newNode.children[0])) {
    return newNode.children[0].children[0];
  }

  // De Morgan Law: (a'b'c')' -> a+b+c
  if (newNode.type === 'NOT' && newNode.children[0].type === 'AND') {
    const andNode = newNode.children[0];
    if (andNode.children.every(isNot)) {
      return {
        type: 'OR',
        children: andNode.children.map(getNotChild)
      };
    }
  }

  // De Morgan Law: (a'+b'+c')' -> ab...
  if (newNode.type === 'NOT' && newNode.children[0].type === 'OR') {
    const orNode = newNode.children[0];
    if (orNode.children.every(isNot)) {
      return {
        type: 'AND',
        children: orNode.children.map(getNotChild)
      };
    }
  }

  // NAND/NOR patterns: (a'b'c') NAND -> a+b+c
  if (newNode.type === 'NAND' && newNode.children.every(isNot)) {
    return {
      type: 'OR',
      children: newNode.children.map(getNotChild)
    };
  }

  if (newNode.type === 'NOR' && newNode.children.every(isNot)) {
    return {
      type: 'AND',
      children: newNode.children.map(getNotChild)
    };
  }

  return newNode;
};

export const simplifyAST = (node: ASTNode): ASTNode => {
  // Apply structural simplification first
  const structuralNode = simplifyStructural(node);
  
  const vars = getVariables(structuralNode);
  if (vars.length > 8) return structuralNode; // Too many variables for truth table

  const table: boolean[] = [];
  const numRows = 1 << vars.length;

  for (let i = 0; i < numRows; i++) {
    const values: Record<string, boolean> = {};
    vars.forEach((v, idx) => {
      values[v] = !!(i & (1 << (vars.length - 1 - idx)));
    });
    table.push(evaluateAST(node, values));
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

  return structuralNode;
};
