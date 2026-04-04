import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Table, 
  BookOpen,
  ChevronUp,
  Cpu,
  Share2,
  Layout
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

  return (
    <div className="flex flex-col h-screen bg-bg-main overflow-hidden text-text-primary">
      {/* Mobile Header */}
      <header className="h-14 shrink-0 border-b border-white/5 bg-panel/90 backdrop-blur-md px-4 flex items-center justify-between z-50">
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
            
            {/* Gates Slide-up Trigger / Panel */}
            <div className="fixed bottom-16 left-0 w-full z-40 bg-panel/95 backdrop-blur-xl border-t border-white/10 transition-all duration-300">
               <div 
                 className="w-full h-8 flex items-center justify-center cursor-pointer border-b border-white/5 active:bg-white/5"
                 onClick={() => setIsGatesOpen(!isGatesOpen)}
               >
                 <motion.div 
                   animate={{ rotate: isGatesOpen ? 180 : 0 }}
                   className="text-text-muted"
                 >
                   <ChevronUp size={24} />
                 </motion.div>
               </div>
               
               <AnimatePresence>
                 {isGatesOpen && (
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: 'auto' }}
                     exit={{ height: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="p-4 overflow-y-auto max-h-[40vh] custom-scrollbar">
                       <ComponentLibrary />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
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
                } catch (e) {
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
      <nav className="h-16 shrink-0 bg-bg-panel border-t border-white/5 flex items-stretch z-50">
        <button 
          onClick={() => setActiveTab('canvas')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'canvas' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <Layout size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">CANVAS</span>
        </button>
        <button 
          onClick={() => setActiveTab('table')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'table' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <Table size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">TABLE</span>
        </button>
        <button 
          onClick={() => setActiveTab('ref')}
          className={`flex-1 flex flex-col items-center justify-center transition-all ${activeTab === 'ref' ? 'bg-primary/10 text-primary border-t-2 border-primary' : 'text-text-muted'}`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-bold tracking-tight mt-1">REF</span>
        </button>
      </nav>
    </div>
  )
}
