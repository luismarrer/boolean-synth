import { useState, useEffect, useCallback, useRef } from 'react'
import { parseExpression } from './logic/parser'
import { astToGraph } from './logic/layout'
import { graphToAST, buildNodeAST } from './logic/generator'
import { stringifyAST } from './logic/ast'
import { CircuitBoard } from './components/CircuitBoard'
import { LeftSidebar } from './components/LeftSidebar'
import { MobileLayout } from './components/MobileLayout'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'
import { Cpu, Share2 } from 'lucide-react'

import { simplifyAST } from './logic/simplifier'

const DEFAULT_EXPRESSION = "a ^ b"
// Computed once at module load — both useState calls share the same result.
const INITIAL_GRAPH = computeInitialGraph(DEFAULT_EXPRESSION)

/** Synchronously parse an expression into a graph for state initialisation.
 *  Called once with a lazy useState() initialiser — never re-runs on render. */
function computeInitialGraph(expr: string) {
  try {
    const ast = parseExpression(expr)
    const { nodes, edges } = astToGraph(ast)
    const edgesWithLabels = edges.map(edge => {
      try {
        const sourceAST = buildNodeAST(edge.source, nodes, edges)
        const expression = stringifyAST(sourceAST, { expanded: false })
        return { ...edge, data: { ...edge.data, expression } }
      } catch {
        return edge
      }
    })
    return { nodes, edges: edgesWithLabels }
  } catch {
    return { nodes: [], edges: [] }
  }
}

function App() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION)
  // Pre-populate with the parsed default expression so React Flow receives
  // real nodes AND edges on the very first render (before any useEffect runs).
  // This lets EdgeWrapper draw edges as soon as handles are measured via its
  // own Zustand subscription to nodeInternals — no manual re-trigger needed.
  const [nodes, setNodes] = useState<RFNode[]>(INITIAL_GRAPH.nodes)
  const [edges, setEdges] = useState<RFEdge[]>(INITIAL_GRAPH.edges)
  const [error, setError] = useState<string | null>(null)
  const [useExpandedNotation, setUseExpandedNotation] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isSyncingRef = useRef(false)
  const isMountedRef = useRef(false)

  // History state for Undo/Redo
  const stateRef = useRef({ expression, nodes, edges })
  useEffect(() => {
    stateRef.current = { expression, nodes, edges }
  }, [expression, nodes, edges])

  const pastRef = useRef<{ expression: string, nodes: RFNode[], edges: RFEdge[] }[]>([])
  const futureRef = useRef<{ expression: string, nodes: RFNode[], edges: RFEdge[] }[]>([])

  const pushToHistory = useCallback(() => {
    pastRef.current.push(stateRef.current)
    if (pastRef.current.length > 50) {
      pastRef.current.shift()
    }
    futureRef.current = [] // clear redo stack on new action
  }, [])

  // Global Keyboard listener for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') return;

      if (cmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) { // Redo: Ctrl+Shift+Z or Cmd+Shift+Z
          if (futureRef.current.length > 0) {
            e.preventDefault();
            const next = futureRef.current.pop()!;
            pastRef.current.push(stateRef.current);
            
            isSyncingRef.current = true;
            setExpression(next.expression);
            setNodes(next.nodes);
            setEdges(next.edges);
            setError(null);
            
            setTimeout(() => { isSyncingRef.current = false; }, 100);
          }
        } else { // Undo: Ctrl+Z or Cmd+Z
          if (pastRef.current.length > 0) {
            e.preventDefault();
            const previous = pastRef.current.pop()!;
            futureRef.current.push(stateRef.current);
            
            isSyncingRef.current = true;
            setExpression(previous.expression);
            setNodes(previous.nodes);
            setEdges(previous.edges);
            setError(null);
            
            setTimeout(() => { isSyncingRef.current = false; }, 100);
          }
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === 'y') { // Redo: Ctrl+Y
        if (futureRef.current.length > 0) {
          e.preventDefault();
          const next = futureRef.current.pop()!;
          pastRef.current.push(stateRef.current);
          
          isSyncingRef.current = true;
          setExpression(next.expression);
          setNodes(next.nodes);
          setEdges(next.edges);
          setError(null);
          
          setTimeout(() => { isSyncingRef.current = false; }, 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024) // Using 1024 as breakpoint for sidebar
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSimplify = () => {
    try {
      pushToHistory()
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
      
      const edgesWithLabels = newEdges.map(edge => {
        try {
          const sourceAST = buildNodeAST(edge.source, newNodes, newEdges)
          const expr = stringifyAST(sourceAST, { expanded: useExpandedNotation })
          return {
            ...edge,
            data: {
              ...edge.data,
              expression: expr
            }
          }
        } catch (e) {
          return edge
        }
      })
      
      setNodes(newNodes)
      setEdges(edgesWithLabels)
      setError(null)
      
      // Force React Flow to recalculate paths after nodes have painted and handles are measured
      setTimeout(() => {
        setEdges(prev => [...prev])
      }, 100)
    } catch (e: any) {
      setError(e.message)
    }
  }, [expression])

  const handleGraphChange = useCallback((newNodes: RFNode[], newEdges: RFEdge[], isStructural = false) => {
    if (isStructural) {
      pushToHistory();
    }
    // Calculate expressions for each edge, always producing new object references
    // so React Flow's controlled-mode sync always detects a change and re-routes.
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
        return { ...edge } // new reference even on error
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
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
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

  if (isMobile) {
    return (
      <MobileLayout
        expression={expression}
        setExpression={setExpression}
        useExpandedNotation={useExpandedNotation}
        setUseExpandedNotation={setUseExpandedNotation}
        handleSimplify={handleSimplify}
        error={error}
        nodes={nodes}
        edges={edges}
        onGraphChange={handleGraphChange}
      />
    )
  }

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
          {/* 
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ml-3 text-sm font-semibold text-slate-300">Simulate</span>
          </label>
          */}
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
