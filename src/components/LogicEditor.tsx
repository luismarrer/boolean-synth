import { motion, AnimatePresence } from 'framer-motion'
import { parseExpression } from '../logic/parser'

interface LogicEditorProps {
  expression: string
  setExpression: (val: string) => void
  useExpandedNotation: boolean
  setUseExpandedNotation: (val: boolean) => void
  handleSimplify: () => void
  error: string | null
  compact?: boolean
}

export function LogicEditor({
  expression,
  setExpression,
  useExpandedNotation,
  setUseExpandedNotation,
  handleSimplify,
  error,
  compact = false
}: LogicEditorProps) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-4'}`}>
      <div className={`input-glow bg-elevated border border-(--border-color) rounded-xl overflow-hidden relative transition-all ${compact ? 'h-12' : 'h-24'}`}>
        <textarea
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className={`w-full h-full bg-transparent p-3 font-mono text-sm focus:outline-none resize-none text-slate-200 placeholder:text-slate-600 ${compact ? 'py-2 leading-tight' : ''}`}
          placeholder="e.g. a + b'"
        />
      </div>
      
      {!compact && (
        <div className="flex justify-between items-center">
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
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-error/10 border border-error/20 rounded-lg text-error text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
