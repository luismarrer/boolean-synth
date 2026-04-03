import { useState, useEffect, useCallback, useRef } from 'react'
import { parseExpression } from './logic/parser'
import { astToGraph } from './logic/layout'
import { graphToAST, buildNodeAST } from './logic/generator'
import { stringifyAST } from './logic/ast'
import { CircuitBoard } from './components/CircuitBoard'
import { LeftSidebar } from './components/LeftSidebar'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { Cpu, Share2 } from 'lucide-react'

import { simplifyAST } from './logic/simplifier'

function App() {
  const [expression, setExpression] = useState("(ab)(a'b+ab')+(ab)'(a'b+ab')'")
  const [nodes, setNodes] = useState<RFNode[]>([])
  const [edges, setEdges] = useState<RFEdge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [useExpandedNotation, setUseExpandedNotation] = useState(false)
  const isSyncingRef = useRef(false)

  const handleSimplify = () => {
    try {
      const ast = parseExpression(expression)
      const simplified = simplifyAST(ast)
      setExpression(stringifyAST(simplified, { expanded: useExpandedNotation }))
    } catch (e: any) {
      setError(e.message)
    }
  }

  // Sync Expression -> Graph
  useEffect(() => {
    try {
      if (isSyncingRef.current) return
      const ast = parseExpression(expression)
      const { nodes: newNodes, edges: newEdges } = astToGraph(ast)
      setNodes(newNodes)
      setEdges(newEdges)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    }
  }, [expression])

  const handleGraphChange = useCallback((newNodes: RFNode[], newEdges: RFEdge[], isStructural = false) => {
    // Calculate expressions for each edge
    const updatedEdges = newEdges.map(edge => {
      try {
        const sourceAST = buildNodeAST(edge.source, newNodes, newEdges)
        const expression = stringifyAST(sourceAST, { expanded: useExpandedNotation })
        return {
          ...edge,
          data: {
            ...edge.data,
            expression
          }
        }
      } catch (e) {
        return edge
      }
    })

    setNodes(newNodes)
    setEdges(updatedEdges)

    if (!isStructural) return

    // Try to sync Graph -> Expression
    try {
      const ast = graphToAST(newNodes, updatedEdges)
      const newExpr = stringifyAST(ast, { expanded: useExpandedNotation })

      isSyncingRef.current = true
      setExpression(newExpr)
      setError(null)
      // Release sync lock after a delay to avoid feedback loops
      setTimeout(() => {
        isSyncingRef.current = false
      }, 100)
    } catch (e: any) {
      // It's okay if drawing is incomplete
    }
  }, [useExpandedNotation])

  // Sync Toggle -> Expression
  useEffect(() => {
    try {
      // Update edge expressions when notation changes
      const updatedEdges = edges.map(edge => {
        try {
          const sourceAST = buildNodeAST(edge.source, nodes, edges)
          const expression = stringifyAST(sourceAST, { expanded: useExpandedNotation })
          return {
            ...edge,
            data: {
              ...edge.data,
              expression
            }
          }
        } catch (e) {
          return edge
        }
      })
      setEdges(updatedEdges)

      const ast = graphToAST(nodes, updatedEdges)
      const newExpr = stringifyAST(ast, { expanded: useExpandedNotation })
      isSyncingRef.current = true
      setExpression(newExpr)
      setTimeout(() => {
        isSyncingRef.current = false
      }, 100)
    } catch (e) {
      // Ignore if graph is in invalid state
    }
  }, [useExpandedNotation])

  return (
    <div className="h-screen bg-bg-main text-text-primary flex flex-col font-sans overflow-hidden selection:bg-primary/30">
      <header className="relative z-10 border-b border-(--border-color) bg-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-primary">
            <Cpu size={28} />
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            Boolean Synth
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-semibold text-slate-300">Simulate</span>
          </label>
        </div>

        <button className="flex items-center gap-2 px-6 py-2 btn-primary font-semibold text-sm">
          <Share2 size={16} />
          Export
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <LeftSidebar
          expression={expression}
          setExpression={setExpression}
          useExpandedNotation={useExpandedNotation}
          setUseExpandedNotation={setUseExpandedNotation}
          handleSimplify={handleSimplify}
          error={error}
        />

        {/* Central Board Area */}
        <div className="flex-1 w-full relative">
          {/* Subtle overlay shadow from sidebar */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-black/20 to-transparent pointer-events-none z-10" />
          <CircuitBoard
            nodes={nodes}
            edges={edges}
            onGraphChange={handleGraphChange}
          />
        </div>
      </main>
    </div>
  )
}

export default App
