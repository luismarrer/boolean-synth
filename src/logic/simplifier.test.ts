import { describe, it, expect } from 'vitest';
import { simplifyAST } from './simplifier';
import { parseExpression } from './parser';
import { stringifyAST } from './ast';

describe('simplifyAST', () => {
  it('should eliminate double negation', () => {
    // (A')' => A
    const ast = parseExpression("(A')'");
    const simplified = simplifyAST(ast);
    expect(stringifyAST(simplified)).toBe('a');
  });

  it('should simplify constants', () => {
    // A & 0 => 0
    // A | 1 => 1
    // Note: Our parser might not handle literal 0/1 yet if not defined, but evaluateAST does.
    // However, simplifyAST checks if the truth table is all true/false.
    
    expect(stringifyAST(simplifyAST(parseExpression('A & 0')))).toBe('0');
    expect(stringifyAST(simplifyAST(parseExpression('A | 1')))).toBe('1');
  });

  it('should simplify identities and idempotency', () => {
    // A & A => A
    expect(stringifyAST(simplifyAST(parseExpression('A & A')))).toBe('a');
    // A | A => A
    expect(stringifyAST(simplifyAST(parseExpression('A | A')))).toBe('a');
    // A & 1 => A
    expect(stringifyAST(simplifyAST(parseExpression('A & 1')))).toBe('a');
  });

  it('should apply De Morgan laws structurally', () => {
    // (A'B')' => A + B
    const ast = parseExpression("(A'B')'");
    const simplified = simplifyAST(ast);
    expect(stringifyAST(simplified)).toBe('a+b');

    // (A'+B')' => AB
    const astOr = parseExpression("(A'+B')'");
    const simplifiedOr = simplifyAST(astOr);
    expect(stringifyAST(simplifiedOr)).toBe('ab');
  });

  it('should detect XOR/XNOR of two variables', () => {
    // AB' + A'B => A ^ B
    const ast = parseExpression("AB' + A'B");
    const simplified = simplifyAST(ast);
    expect(simplified.type).toBe('XOR');
    
    // AB + A'B' => A ⊙ B
    const astXnor = parseExpression("AB + A'B'");
    const simplifiedXnor = simplifyAST(astXnor);
    expect(simplifiedXnor.type).toBe('XNOR');
  });
});
