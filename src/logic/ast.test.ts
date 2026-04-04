import { describe, it, expect } from 'vitest';
import { getVariables, evaluateAST, stringifyAST } from './ast';
import type { ASTNode } from './ast';

describe('AST logic', () => {
  const nodeA: ASTNode = { type: 'VAR', name: 'a', children: [] };
  const nodeB: ASTNode = { type: 'VAR', name: 'b', children: [] };
  const nodeAnd: ASTNode = { type: 'AND', children: [nodeA, nodeB] };

  describe('getVariables', () => {
    it('should extract sorted variable names from a simple node', () => {
      const vars = getVariables(nodeAnd);
      expect(vars).toEqual(['a', 'b']);
    });

    it('should handle repeated variables', () => {
      const complex: ASTNode = { 
        type: 'OR', 
        children: [nodeAnd, { type: 'VAR', name: 'a', children: [] }] 
      };
      const vars = getVariables(complex);
      expect(vars).toEqual(['a', 'b']);
    });

    it('should ignore 0 and 1 literals', () => {
      const node: ASTNode = {
        type: 'AND',
        children: [
            { type: 'VAR', name: '1', children: [] },
            { type: 'VAR', name: 'x', children: [] }
        ]
      };
      expect(getVariables(node)).toEqual(['x']);
    });
  });

  describe('evaluateAST', () => {
    it('should evaluate AND correctly', () => {
      expect(evaluateAST(nodeAnd, { a: true, b: true })).toBe(true);
      expect(evaluateAST(nodeAnd, { a: true, b: false })).toBe(false);
      expect(evaluateAST(nodeAnd, { a: false, b: true })).toBe(false);
      expect(evaluateAST(nodeAnd, { a: false, b: false })).toBe(false);
    });

    it('should evaluate NOT correctly', () => {
      const nodeNot: ASTNode = { type: 'NOT', children: [nodeA] };
      expect(evaluateAST(nodeNot, { a: true })).toBe(false);
      expect(evaluateAST(nodeNot, { a: false })).toBe(true);
    });

    it('should evaluate XOR correctly', () => {
      const nodeXor: ASTNode = { type: 'XOR', children: [nodeA, nodeB] };
      expect(evaluateAST(nodeXor, { a: true, b: true })).toBe(false);
      expect(evaluateAST(nodeXor, { a: true, b: false })).toBe(true);
      expect(evaluateAST(nodeXor, { a: false, b: true })).toBe(true);
      expect(evaluateAST(nodeXor, { a: false, b: false })).toBe(false);
    });

    it('should handle 1 and 0 literals', () => {
       const node0: ASTNode = { type: 'VAR', name: '0', children: [] };
       const node1: ASTNode = { type: 'VAR', name: '1', children: [] };
       expect(evaluateAST(node0, {})).toBe(false);
       expect(evaluateAST(node1, {})).toBe(true);
    });
  });

  describe('stringifyAST', () => {
    it('should stringify a simple variable', () => {
      expect(stringifyAST(nodeA)).toBe('a');
    });

    it('should stringify AND with prime notation for NOT', () => {
      const nodeNot: ASTNode = { type: 'NOT', children: [nodeA] };
      const combined: ASTNode = { type: 'AND', children: [nodeNot, nodeB] };
      // By implementation: Not is a'
      expect(stringifyAST(combined)).toBe("a'b");
    });

    it('should stringify OR with +', () => {
        const nodeOr: ASTNode = { type: 'OR', children: [nodeA, nodeB] };
        expect(stringifyAST(nodeOr)).toBe('a+b');
    });

    it('should handle parentheses to respect precedence', () => {
        // (A+B)C
        const nodeOr: ASTNode = { type: 'OR', children: [nodeA, nodeB] };
        const nodeAndParenthesized: ASTNode = { type: 'AND', children: [nodeOr, { type: 'VAR', name: 'c', children: [] }] };
        expect(stringifyAST(nodeAndParenthesized)).toBe("(a+b)c");
    });
  });
});
