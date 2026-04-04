import { describe, it, expect } from 'vitest';
import { buildNodeAST, graphToAST } from './generator';
import { Node, Edge } from 'reactflow';

describe('generator logic', () => {
  const nodes: Node[] = [
    { id: '1', type: 'inputNode', data: { label: 'A' }, position: { x: 0, y: 0 } },
    { id: '2', type: 'inputNode', data: { label: 'B' }, position: { x: 0, y: 100 } },
    { id: '3', type: 'logicGate', data: { label: 'AND' }, position: { x: 100, y: 50 } },
    { id: '4', type: 'outputNode', data: { label: 'f' }, position: { x: 200, y: 50 } }
  ];

  const edges: Edge[] = [
    { id: 'e1-3', source: '1', target: '3' },
    { id: 'e2-3', source: '2', target: '3' },
    { id: 'e3-4', source: '3', target: '4' }
  ];

  describe('buildNodeAST', () => {
    it('should build AST from a single variable input node', () => {
      const ast = buildNodeAST('1', nodes, edges);
      expect(ast).toEqual({ type: 'VAR', name: 'a', children: [] });
    });

    it('should build AST recursively for a gate', () => {
      const ast = buildNodeAST('3', nodes, edges);
      expect(ast.type).toBe('AND');
      expect(ast.children).toHaveLength(2);
      expect(ast.children[0]).toEqual({ type: 'VAR', name: 'a', children: [] });
      expect(ast.children[1]).toEqual({ type: 'VAR', name: 'b', children: [] });
    });
  });

  describe('graphToAST', () => {
    it('should start from outputNode and build full AST', () => {
      const ast = graphToAST(nodes, edges);
      // graphToAST also calls simplifyAST, but for this simple AND it should remain same
      expect(ast.type).toBe('AND');
      expect(ast.children).toHaveLength(2);
    });

    it('should return placeholder if output is disconnected', () => {
      const disconnectedEdges = edges.filter(e => e.id !== 'e3-4');
      const ast = graphToAST(nodes, disconnectedEdges);
      expect(ast).toEqual({ type: 'VAR', name: '?', children: [] });
    });

    it('should throw if no output node is found', () => {
      expect(() => graphToAST(nodes.filter(n => n.type !== 'outputNode'), edges)).toThrow();
    });
  });
});
