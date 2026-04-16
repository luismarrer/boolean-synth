import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Table, 
  BookOpen,
  X,
  Cpu,
  Share2,
  Layout,
  Blocks
} from 'lucide-react'
import { LogicEditor } from './LogicEditor'
import { ComponentLibrary } from './ComponentLibrary'
import { TruthTable } from './TruthTable'
import { CheatSheet } from './CheatSheet'
import { CircuitBoard } from './CircuitBoard'
import { parseExpression } from '../logic/parser'
import type { Node as RFNode, Edge as RFEdge } from 'reactflow'

interface MobileLayoutProps {
  expression: string
  setExpression: (val: string) => void
  useExpandedNotation: boolean
  setUseExpandedNotation: (val: boolean) => void
  handleSimplify: () => void
  error: string | null
  nodes: RFNode[]
  edges: RFEdge[]
  onGraphChange: (nodes: RFNode[], edges: RFEdge[], isStructural?: boolean) => void
}

type Tab = 'canvas' | 'table' | 'ref'

export function MobileLayout({
  expression,
  setExpression,
  useExpandedNotation,
  setUseExpandedNotation,
  handleSimplify,
  error,
  nodes,
  edges,
  onGraphChange
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>('canvas')
  const [isGatesOpen, setIsGatesOpen] = useState(false)
  const toggleTab = (tab: Tab) => {
    setActiveTab(tab)
    setIsGatesOpen(false)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-bg-main overflow-hidden text-text-primary">
      {/* Mobile Header */}
      <header
        className="shrink-0 border-b border-white/5 bg-panel/90 backdrop-blur-md px-4 h-14 flex items-center justify-between z-50"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-2">
          <Cpu className="text-primary w-5 h-5" />
          <h1 className="text-xs font-bold text-primary tracking-widest uppercase font-headline">
            BOOLEAN_SYNTH
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <Share2 size={18} />
          </button>
          <button className="p-2 text-text-muted hover:text-text-primary transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Top Expression Bar */}
      <div className="shrink-0 bg-bg-panel border-b border-white/5 p-2 px-3 flex items-center gap-2 z-40">
        <div className="flex-1">
          <LogicEditor
            expression={expression}
            setExpression={setExpression}
            useExpandedNotation={useExpandedNotation}
            setUseExpandedNotation={setUseExpandedNotation}
            handleSimplify={handleSimplify}
            error={error}
            compact={true}
          />
        </div>
        <button
          onClick={() => setUseExpandedNotation(!useExpandedNotation)}
          className={`text-xs font-semibold px-2.5 h-10 rounded border transition-colors ${useExpandedNotation
            ? 'bg-primary/20 text-primary border-primary/50'
            : 'bg-white/5 text-text-muted border-white/10'
            }`}
          title="Toggle expanded notation"
        >
          EXP
        </button>
        <button 
          onClick={handleSimplify}
          className="bg-primary text-slate-900 w-10 h-10 rounded flex items-center justify-center active:scale-95 transition-transform"
          title="Simplify"
        >
          <Cpu size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'canvas' && (
          <div className="w-full h-full">
            <CircuitBoard
              nodes={nodes}
              edges={edges}
              onGraphChange={onGraphChange}
            />

            <button
              onClick={() => setIsGatesOpen(true)}
              className="absolute right-4 bottom-20 z-30 bg-primary text-slate-900 rounded-full h-12 px-4 font-semibold text-sm shadow-lg shadow-cyan-500/30 flex items-center gap-2"
            >
              <Blocks size={18} />
              Gates
            </button>

            <AnimatePresence>
              {isGatesOpen && (
                <>
                  <motion.button
                    aria-label="Close gates panel"
                    className="absolute inset-0 bg-black/45 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsGatesOpen(false)}
                  />
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 24, stiffness: 240 }}
                    className="absolute left-0 right-0 bottom-0 z-50 bg-panel border-t border-white/10 rounded-t-2xl"
                    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
                  >
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Library</p>
                      <button
                        onClick={() => setIsGatesOpen(false)}
                        className="p-2 rounded-md text-text-muted hover:text-white hover:bg-white/10"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[55dvh] custom-scrollbar">
                      <ComponentLibrary />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'table' && (
          <div className="w-full h-full overflow-y-auto p-4 flex flex-col gap-6 bg-bg-main relative z-10">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2">Truth Table</h2>
            <div className="bg-bg-panel/50 rounded-xl border border-white/5 overflow-hidden">
              {(() => {
                try {
                  const ast = parseExpression(expression)
                  return <TruthTable ast={ast} />
                } catch {
                  return <div className="p-4 text-text-muted italic">Invalid expression</div>
                }
              })()}
            </div>
          </div>
        )}

        {activeTab === 'ref' && (
          <div className="w-full h-full overflow-y-auto p-4 bg-bg-main relative z-10">
            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 mb-4">Reference Guide</h2>
            <CheatSheet />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="h-16 shrink-0 bg-bg-panel border-t border-white/5 flex items-stretch z-50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <button 
          onClick={() => toggleTab('canvas')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'canvas' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <Layout size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">CANVAS</span>
        </button>
        <button 
          onClick={() => toggleTab('table')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'table' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <Table size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">TABLE</span>
        </button>
        <button 
          onClick={() => toggleTab('ref')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'ref' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">REF</span>
        </button>
      </nav>
    </div>
  )
}
