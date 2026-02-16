import { Handle, Position } from 'reactflow'
import type { LucideIcon } from 'lucide-react'
import { Trash2 } from 'lucide-react'

interface GateNodeProps {
    data: {
        label: string
        icon: LucideIcon
        color: string
        onDelete?: () => void
    }
}

export const GateNode = ({ data }: GateNodeProps) => {
    const Icon = data.icon

    return (
        <div className="px-6 py-4 shadow-xl rounded-xl bg-slate-900/90 border border-slate-700/50 backdrop-blur-sm min-w-[120px] group transition-all hover:border-blue-500/50">
            <div className="flex flex-col items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-800/50 group-hover:bg-blue-500/10 transition-colors">
                    <Icon size={40} color={data.color} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{data.label}</div>
            </div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-primary border-2 border-slate-900"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-secondary border-2 border-slate-900"
            />

            {data.onDelete && (
                <button
                    onClick={data.onDelete}
                    className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    )
}

export const InputNode = ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 shadow-lg rounded-full bg-[#3b82f6] border-2 border-[#1d4ed8] min-w-[80px]">
        <div className="text-center font-bold text-white uppercase text-sm">{data.label}</div>
        <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-blue-700"
        />
    </div>
)

export const OutputNode = ({ data }: { data: { label: string } }) => (
    <div className="px-4 py-2 shadow-lg rounded-full bg-[#10b981] border-2 border-[#047857] min-w-[80px]">
        <div className="text-center font-bold text-white uppercase text-sm">{data.label}</div>
        <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-emerald-700"
        />
    </div>
)
