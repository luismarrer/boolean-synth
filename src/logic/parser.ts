import type { ASTNode, NodeType } from './ast';

type TokenType = 'VAR' | 'OPERATOR' | 'LPAREN' | 'RPAREN';

interface Token {
  type: TokenType;
  value: string;
}

const PRECEDENCE: Record<string, number> = {
  "'": 4, '!': 4, '~': 4,
  '*': 3, '&': 3, 'AND': 3, 'NAND': 3,
  '+': 2, '|': 2, 'OR': 2, 'NOR': 2, 'XOR': 2, 'XNOR': 2, '^': 2
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
      let varName = char;
      i++;
      while (i < input.length && /[a-zA-Z0-9]/.test(input[i])) {
        varName += input[i];
        i++;
      }
      // Check if it's a multi-char operator
      const upperVar = varName.toUpperCase();
      if (['AND', 'OR', 'XOR', 'XNOR', 'NAND', 'NOR'].includes(upperVar)) {
        tokens.push({ type: 'OPERATOR', value: upperVar });
      } else {
        tokens.push({ type: 'VAR', value: varName });
      }
    } else if (["'", "!", "~", "*", "&", "+", "|", "^"].includes(char)) {
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
  
  const createNode = (op: string) => {
    let type: NodeType;
    switch (op) {
      case "'": case "!": case "~":
        type = 'NOT';
        const node = outputStack.pop();
        if (!node) throw new Error("Invalid expression");
        outputStack.push({ type, children: [node] });
        return;
      case '*': case '&': case 'AND': type = 'AND'; break;
      case '+': case '|': case 'OR': type = 'OR'; break;
      case '^': case 'XOR': type = 'XOR'; break;
      case 'XNOR': type = 'XNOR'; break;
      case 'NAND': type = 'NAND'; break;
      case 'NOR': type = 'NOR'; break;
      default: return;
    }
    
    const right = outputStack.pop();
    const left = outputStack.pop();
    if (!left || !right) throw new Error("Invalid expression");
    outputStack.push({ type, children: [left, right] });
  };

  tokens.forEach(token => {
    if (token.type === 'VAR') {
      outputStack.push({ type: 'VAR', name: token.value, children: [] });
    } else if (token.type === 'LPAREN') {
      operatorStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
        createNode(operatorStack.pop()!.value);
      }
      operatorStack.pop(); // Remove LPAREN
      
      // Check for postfix NOT immediately after RPAREN
      // Handled by lexer but let's be safe
    } else if (token.type === 'OPERATOR') {
      const op = token.value;
      // Handle postfix NOT '
      if (op === "'") {
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
