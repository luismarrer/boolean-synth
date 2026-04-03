import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CollapsibleSection } from './CollapsibleSection'
import { ComponentLibrary } from './ComponentLibrary'
import { CheatSheet } from './CheatSheet'
import { TruthTable } from './TruthTable'
import { parseExpression } from '../logic/parser'

interface LeftSidebarProps {
  expression: string
  setExpression: (val: string) => void
  useExpandedNotation: boolean
  setUseExpandedNotation: (val: boolean) => void
  handleSimplify: () => void
  error: string | null
}

export function LeftSidebar({
  expression,
  setExpression,
  useExpandedNotation,
  setUseExpandedNotation,
  handleSimplify,
  error
}: LeftSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(320);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(260, Math.min(startWidth + (moveEvent.clientX - startX), 600));
      setWidth(newWidth);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 48 : width }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-panel border-r border-(--border-color) flex flex-col h-full z-10 shrink-0 min-h-0 relative"
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-50 bg-slate-800 border border-slate-600 text-slate-300 rounded-full p-1 hover:bg-slate-700 hover:text-white transition-colors shadow-lg"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className={`flex-1 flex flex-col h-full overflow-hidden ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ transition: 'opacity 0.2s' }}>
        <div 
          className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-4 gap-4"
          style={{ width: width, minWidth: width }}
        >
          <CollapsibleSection title="Logic Editor" defaultOpen={true}>
        <div className="mt-3 input-glow bg-elevated border border-(--border-color) rounded-xl overflow-hidden relative transition-all">
          <textarea
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full h-24 bg-transparent p-3 font-mono text-sm focus:outline-none resize-none text-slate-200 placeholder:text-slate-600"
            placeholder="e.g. a + b'"
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <label className="text-[10px] text-slate-500 font-medium flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useExpandedNotation}
              onChange={(e) => setUseExpandedNotation(e.target.checked)}
              className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/50"
            />
            Expanded
          </label>
          <button
            onClick={handleSimplify}
            className="px-4 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded text-xs font-semibold transition-colors"
            title="Simplify Expression"
          >
            Simplify
          </button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleSection>

      <CollapsibleSection title="Components" defaultOpen={true}>
        <div className="mt-2 text-slate-400">
           <ComponentLibrary />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Reference" defaultOpen={false}>
        <CheatSheet />
      </CollapsibleSection>

      <CollapsibleSection title="Live Truth Table" defaultOpen={true}>
        <div className="mt-3 overflow-x-auto">
          {(() => {
            try {
              const ast = parseExpression(expression)

              return (
                <div className="space-y-4">
                  <TruthTable ast={ast} />
                </div>
              )
            } catch (e) {
              return <p className="text-xs text-slate-500 italic px-2">Enter a valid expression</p>
            }
          })()}
        </div>
      </CollapsibleSection>
        </div>
      </div>

      {!isCollapsed && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50 active:bg-primary z-20 group transition-colors"
          onMouseDown={handleMouseDown}
        >
           <div className="absolute top-1/2 -mt-4 -left-1 hidden group-hover:flex flex-col gap-0.5 items-center justify-center h-8 w-3.5 bg-slate-800 border border-slate-600 rounded-sm shadow-md">
             <div className="w-0.5 h-1 bg-slate-400 rounded-full" />
             <div className="w-0.5 h-1 bg-slate-400 rounded-full" />
             <div className="w-0.5 h-1 bg-slate-400 rounded-full" />
           </div>
        </div>
      )}
    </motion.aside>
  )
}
