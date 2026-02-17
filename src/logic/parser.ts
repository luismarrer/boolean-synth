import type { ASTNode, NodeType } from './ast';

type TokenType = 'VAR' | 'OPERATOR' | 'LPAREN' | 'RPAREN' | 'COMMA';

interface Token {
  type: TokenType;
  value: string;
}

const PRECEDENCE: Record<string, number> = {
  "'": 4, '!': 4, '~': 4,
  '*': 3, '&': 3, 'AND': 3, 'NAND': 3,
  '+': 2, '|': 2, 'OR': 2, 'NOR': 2, 'XOR': 2, 'XNOR': 2, '^': 2, '⊙': 2
};

const lex = (input: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < input.length) {
    const char = input[i];
    
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
    } else if (/[a-zA-Z]/.test(char)) {
      let word = char;
      i++;
      while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) {
        word += input[i];
        i++;
      }
      
      const upperWord = word.toUpperCase();
      if (['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'].includes(upperWord)) {
        tokens.push({ type: 'OPERATOR', value: upperWord });
      } else {
        // If it's not an operator, treat each character as a variable
        // (with common sense: a1 is one variable, but ab is a*b)
        let j = 0;
        while (j < word.length) {
          let varName = word[j];
          j++;
          // Handle cases like a1, x12 etc as single variables
          while (j < word.length && /[0-9]/.test(word[j])) {
            varName += word[j];
            j++;
          }
          tokens.push({ type: 'VAR', value: varName });
        }
      }
    } else if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
    } else if (["'", "!", "~", "*", "&", "+", "|", "^", "⊙"].includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char });
      i++;
    } else {
      i++; // Ignore unknown characters
    }
  }
  
  // Implicit multiplication: (ab) -> (a*b)
  const tokensWithImplicit: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    tokensWithImplicit.push(tokens[j]);
    if (j < tokens.length - 1) {
      const curr = tokens[j];
      const next = tokens[j + 1];
      
      const isCurrOperand = curr.type === 'VAR' || curr.type === 'RPAREN' || curr.value === "'";
      const isNextOperand = next.type === 'VAR' || next.type === 'LPAREN';
      
      if (isCurrOperand && isNextOperand) {
        tokensWithImplicit.push({ type: 'OPERATOR', value: '*' });
      }
    }
  }
  
  return tokensWithImplicit;
};

export const parseExpression = (input: string): ASTNode => {
  const tokens = lex(input);
  const operatorStack: Token[] = [];
  const outputStack: ASTNode[] = [];
  // To handle N-ary function calls: track how many args each function on the stack has
  const argCountStack: number[] = [];
  
  const createNode = (op: string, argCount?: number) => {
    let type: NodeType;
    let unary = false;
    switch (op) {
      case "'": case "!": case "~":
        type = 'NOT';
        unary = true;
        break;
      case '*': case '&': case 'AND': type = 'AND'; break;
      case '+': case '|': case 'OR': type = 'OR'; break;
      case '^': case 'XOR': type = 'XOR'; break;
      case '⊙': case 'XNOR': type = 'XNOR'; break;
      case 'NAND': type = 'NAND'; break;
      case 'NOR': type = 'NOR'; break;
      default: return;
    }
    
    if (unary) {
      const node = outputStack.pop();
      if (!node) throw new Error("Invalid expression");
      outputStack.push({ type, children: [node] });
    } else {
      const count = argCount ?? 2;
      const children: ASTNode[] = [];
      for (let k = 0; k < count; k++) {
        const child = outputStack.pop();
        if (!child) throw new Error(`Invalid expression for operator ${op}`);
        children.unshift(child);
      }
      outputStack.push({ type, children });
    }
  };

  tokens.forEach((token, index) => {
    if (token.type === 'VAR') {
      outputStack.push({ type: 'VAR', name: token.value, children: [] });
      if (argCountStack.length > 0) {
        argCountStack[argCountStack.length - 1]++;
      }
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        createNode(operatorStack.pop()!.value);
      }
      operatorStack.pop(); // Remove LPAREN
      
      // If the top of operator stack is a function, create its node
      if (operatorStack.length > 0 && 
          operatorStack[operatorStack.length - 1].type === 'OPERATOR' &&
          ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'].includes(operatorStack[operatorStack.length - 1].value.toUpperCase())) {
        const count = argCountStack.pop() || 0;
        createNode(operatorStack.pop()!.value, count);
      } else if (argCountStack.length > 0) {
        // Parenthesized expression counts as one operand for outer function
        argCountStack[argCountStack.length - 1]++;
      }
    } else if (token.type === 'COMMA') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        createNode(operatorStack.pop()!.value);
      }
      // Commas are only valid inside function calls, so they shouldn't increment argCount themselves,
      // but they indicate that another argument is coming. 
      // Actually, we increment argCount when we see a VAR or a closing RPAREN (of a sub-expression).
    } else if (token.type === 'OPERATOR') {
      const op = token.value;
      
      // Check if it's a function call: peak ahead for (
      const nextToken = tokens[index + 1];
      if (nextToken && nextToken.type === 'LPAREN' && ['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'].includes(op.toUpperCase())) {
        operatorStack.push(token);
        argCountStack.push(0);
      } else if (op === "'") {
        createNode("'");
      } else {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1].type !== 'LPAREN' &&
          PRECEDENCE[operatorStack[operatorStack.length - 1].value] >= PRECEDENCE[op]
        ) {
          createNode(operatorStack.pop()!.value);
        }
        operatorStack.push(token);
      }
    }
  });

  while (operatorStack.length > 0) {
    createNode(operatorStack.pop()!.value);
  }

  if (outputStack.length !== 1) {
    throw new Error("Invalid expression at the end");
  }

  return outputStack[0];
};
