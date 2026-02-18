import type { ASTNode } from '../logic/ast'
import { generateTruthTable } from '../logic/ast'

interface TruthTableProps {
    ast: ASTNode
    title?: string
}

export const TruthTable: React.FC<TruthTableProps> = ({ ast, title }) => {
    const { variables, rows } = generateTruthTable(ast)

    if (variables.length > 5) {
        return (
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-sm italic">
                Too many variables to display truth table ({variables.length}).
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {title && (
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">
                    {title}
                </h3>
            )}
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50">
                            {variables.map(v => (
                                <th key={v} className="px-3 py-2 text-xs font-bold text-slate-400 border-r border-slate-700/50 last:border-r-0 uppercase">
                                    {v}
                                </th>
                            ))}
                            <th className="px-3 py-2 text-xs font-bold text-blue-400 uppercase text-center">
                                Out
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-t border-slate-800/50 hover:bg-white/5 transition-colors">
                                {variables.map(v => (
                                    <td key={v} className="px-3 py-1.5 font-mono text-sm border-r border-slate-800/50 last:border-r-0">
                                        <span className={row.values[v] ? 'text-emerald-400' : 'text-slate-600'}>
                                            {row.values[v] ? '1' : '0'}
                                        </span>
                                    </td>
                                ))}
                                <td className="px-3 py-1.5 font-mono text-sm text-center">
                                    <span className={`px-2 py-0.5 rounded ${row.result ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {row.result ? '1' : '0'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
