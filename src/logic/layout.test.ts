import { describe, it, expect } from 'vitest';
import { astToGraph } from './layout';
import { parseExpression } from './parser';

describe('layout logic', () => {
  it('should convert a simple variable to a graph', () => {
    const ast = parseExpression('A');
    const { nodes, edges } = astToGraph(ast);
    
    // Should have: 1 input node, 1 output node
    // Wait, the implementation of astToGraph for a single variable VAR:
    // traverse(VAR) returns { id: 'input-a', height: 80 }
    // then adds output node and edge from input to output.
    
    const inputNodes = nodes.filter(n => n.type === 'inputNode');
    const outputNodes = nodes.filter(n => n.type === 'outputNode');
    
    expect(inputNodes).toHaveLength(1);
    expect(outputNodes).toHaveLength(1);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe(inputNodes[0].id);
    expect(edges[0].target).toBe(outputNodes[0].id);
  });

  it('should convert an AND gate to a graph', () => {
    const ast = parseExpression('A & B');
    const { nodes, edges } = astToGraph(ast);
    
    const inputNodes = nodes.filter(n => n.type === 'inputNode');
    const gateNodes = nodes.filter(n => n.type === 'gateNode');
    const outputNodes = nodes.filter(n => n.type === 'outputNode');
    
    expect(inputNodes).toHaveLength(2);
    expect(gateNodes).toHaveLength(1);
    expect(outputNodes).toHaveLength(1);
    
    // 2 edges from inputs to gate, 1 edge from gate to output = 3 edges
    expect(edges).toHaveLength(3);
    
    const gateId = gateNodes[0].id;
    const inputIds = inputNodes.map(n => n.id);
    
    // Check edges to gate
    const toGate = edges.filter(e => e.target === gateId);
    expect(toGate).toHaveLength(2);
    expect(inputIds).toContain(toGate[0].source);
    expect(inputIds).toContain(toGate[1].source);
    
    // Check edge to output
    const toOutput = edges.find(e => e.target === 'output-node');
    expect(toOutput?.source).toBe(gateId);
  });

  it('should apply preprocessing (NOT+AND -> NAND)', () => {
    const ast = parseExpression("!(A & B)");
    const { nodes } = astToGraph(ast);
    
    const gateNodes = nodes.filter(n => n.type === 'gateNode');
    expect(gateNodes).toHaveLength(1);
    expect(gateNodes[0].data.label).toBe('NAND');
  });
});
