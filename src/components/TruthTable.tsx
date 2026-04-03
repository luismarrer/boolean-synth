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
            <div className="overflow-hidden rounded-xl border border-(--border-color) bg-elevated">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="border-b border-(--border-color)">
                            {variables.map(v => (
                                <th key={v} className="px-2 py-2 text-xs font-bold text-slate-300 border-r border-(--border-color) last:border-r-0 uppercase">
                                    {v}
                                </th>
                            ))}
                            <th className="px-2 py-2 text-xs font-bold text-slate-300 uppercase">
                                OUT
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-(--border-color) hover:bg-white/5 transition-colors last:border-b-0">
                                {variables.map(v => (
                                    <td key={v} className="px-2 py-1.5 font-mono text-xs border-r border-(--border-color) last:border-r-0">
                                        <span className={`inline-block w-5 h-5 leading-5 text-center rounded-sm ${row.values[v] ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                            {row.values[v] ? '1' : '0'}
                                        </span>
                                    </td>
                                ))}
                                <td className="px-2 py-1.5 font-mono text-xs text-center">
                                    <span className={`inline-block w-5 h-5 leading-5 text-center rounded-sm ${row.result ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
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
