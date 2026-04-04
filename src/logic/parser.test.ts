import { describe, it, expect } from 'vitest';
import { parseExpression } from './parser';

describe('parseExpression', () => {
  it('should parse a single variable', () => {
    const ast = parseExpression('A');
    expect(ast).toEqual({
      type: 'VAR',
      name: 'a',
      children: []
    });
  });

  it('should parse AND with different notations', () => {
    const expected = {
      type: 'AND',
      children: [
        { type: 'VAR', name: 'a', children: [] },
        { type: 'VAR', name: 'b', children: [] }
      ]
    };

    expect(parseExpression('A AND B')).toEqual(expected);
    expect(parseExpression('A & B')).toEqual(expected);
    expect(parseExpression('A * B')).toEqual(expected);
    expect(parseExpression('AB')).toEqual(expected);
  });

  it('should parse OR with different notations', () => {
    const expected = {
      type: 'OR',
      children: [
        { type: 'VAR', name: 'a', children: [] },
        { type: 'VAR', name: 'b', children: [] }
      ]
    };

    expect(parseExpression('A OR B')).toEqual(expected);
    expect(parseExpression('A | B')).toEqual(expected);
    expect(parseExpression('A + B')).toEqual(expected);
  });

  it('should parse NOT with different notations', () => {
    const varA = { type: 'VAR', name: 'a', children: [] };
    
    expect(parseExpression("A'")).toEqual({
      type: 'NOT',
      children: [varA]
    });
    expect(parseExpression('!A')).toEqual({
      type: 'NOT',
      children: [varA]
    });
    expect(parseExpression('~A')).toEqual({
      type: 'NOT',
      children: [varA]
    });
  });

  it('should respect operator precedence (AND over OR)', () => {
    // A + BC  =>  A + (B * C)
    const ast = parseExpression('A + BC');
    expect(ast.type).toBe('OR');
    expect(ast.children[0]).toEqual({ type: 'VAR', name: 'a', children: [] });
    expect(ast.children[1].type).toBe('AND');
  });

  it('should respect parentheses', () => {
    // (A + B)C
    const ast = parseExpression('(A + B)C');
    expect(ast.type).toBe('AND');
    expect(ast.children[0].type).toBe('OR');
    expect(ast.children[1]).toEqual({ type: 'VAR', name: 'c', children: [] });
  });

  it('should parse function-like notation', () => {
    const ast = parseExpression('AND(A, B, C)');
    expect(ast).toEqual({
      type: 'AND',
      children: [
        { type: 'VAR', name: 'a', children: [] },
        { type: 'VAR', name: 'b', children: [] },
        { type: 'VAR', name: 'c', children: [] }
      ]
    });
  });

  it('should handle complex nested expressions', () => {
    // A(B + C)' + D
    const ast = parseExpression("A(B + C)' + D");
    expect(ast.type).toBe('OR');
    expect(ast.children[1]).toEqual({ type: 'VAR', name: 'd', children: [] });
    
    const leftSide = ast.children[0];
    expect(leftSide.type).toBe('AND');
    expect(leftSide.children[0]).toEqual({ type: 'VAR', name: 'a', children: [] });
    expect(leftSide.children[1].type).toBe('NOT');
  });
});
