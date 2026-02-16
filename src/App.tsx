import { useState, useEffect, useCallback } from 'react'
import { parseExpression } from './logic/parser'
import { astToGraph } from './logic/layout'
import { graphToAST } from './logic/generator'
import { stringifyAST } from './logic/ast'
import { CircuitBoard } from './components/CircuitBoard'
import type { Node, Edge } from 'reactflow'
import { Cpu, RotateCcw, Share2, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [expression, setExpression] = useState("(ab)(a'b+ab')+(ab)'(a'b+ab')'")
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSyncingFromExpr, setIsSyncingFromExpr] = useState(false)

  // Sync Expression -> Graph
  useEffect(() => {
    try {
      if (isSyncingFromExpr) return
      const ast = parseExpression(expression)
      const { nodes: newNodes, edges: newEdges } = astToGraph(ast)
      setNodes(newNodes)
      setEdges(newEdges)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    }
  }, [expression, isSyncingFromExpr])

  const handleGraphChange = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setNodes(newNodes)
    setEdges(newEdges)

    // Try to sync Graph -> Expression
    try {
      const ast = graphToAST(newNodes, newEdges)
      const newExpr = stringifyAST(ast)
      setIsSyncingFromExpr(true)
      setExpression(newExpr)
      setError(null)
      // Release sync lock after a delay to avoid feedback loops
      setTimeout(() => setIsSyncingFromExpr(false), 100)
    } catch (e: any) {
      // It's okay if drawing is incomplete
    }
  }, [])

  const handleReset = () => {
    setExpression("a+b")
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <Cpu size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Boolean Synth
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-600/20">
            <Share2 size={18} />
            <span>Export</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="space-y-6 flex flex-col">
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={16} />
              Boolean Expression
            </h2>
            <textarea
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-xl p-4 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
              placeholder="e.g. (a+b)c'"
            />
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="glass p-6 rounded-2xl flex-1 overflow-auto">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Cheat Sheet
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">AND</span>
                <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">ab</code>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">OR</span>
                <code className="bg-slate-800 px-2 py-1 rounded text-emerald-400">a+b</code>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">NOT</span>
                <code className="bg-slate-800 px-2 py-1 rounded text-red-400">a'</code>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">XOR</span>
                <code className="bg-slate-800 px-2 py-1 rounded text-amber-400">a^b</code>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">NAND</span>
                <code className="bg-slate-800 px-2 py-1 rounded text-cyan-400">NAND(a,b)</code>
              </div>
            </div>
            <p className="mt-8 text-xs text-slate-500 italic">
              * Support for multiple variables, parentheses, and implicit multiplication.
            </p>
          </section>
        </div>

        {/* Board */}
        <div className="lg:col-span-2 h-full">
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
