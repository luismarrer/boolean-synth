import { Handle, Position } from 'reactflow'
import type { LucideIcon } from 'lucide-react'
import { Trash2 } from 'lucide-react'

interface GateNodeProps {
    id: string
    data: {
        label: string
        icon: LucideIcon
        color: string
        onDelete?: (id: string) => void
    }
}

export const GateNode = ({ id, data }: GateNodeProps) => {
    const Icon = data.icon

    return (
        <div className="relative flex flex-col items-center justify-center group min-w-[80px] min-h-[50px] transition-all">
            <Icon size={72} color={data.color} className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-transform group-hover:scale-105" />
            
            {/* Label */}
            <div className="absolute -bottom-5 text-[10px] font-bold text-slate-500/0 group-hover:text-slate-500 uppercase tracking-widest transition-colors">{data.label}</div>

            {/* Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-primary border-2 border-bg-panel/50 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ left: '-6px' }}
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-secondary border-2 border-bg-panel/50 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ right: '-6px' }}
            />

            {data.onDelete && (
                <button
                    onClick={() => data.onDelete?.(id)}
                    className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
    )
}

export const InputNode = ({ id, data }: { id: string, data: { label: string, onDelete?: (id: string) => void, onLabelChange?: (id: string, label: string) => void } }) => (
    <div className="px-4 py-2 shadow-lg rounded-full bg-[#3b82f6] border-2 border-[#1d4ed8] min-w-[100px] group relative">
        <input
            type="text"
            value={data.label}
            onChange={(e) => data.onLabelChange?.(id, e.target.value.toLowerCase())}
            className="bg-transparent text-center font-bold text-white lowercase text-sm w-full focus:outline-none"
        />
        <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-white border-2 border-blue-700"
        />
        {data.onDelete && (
            <button
                onClick={() => data.onDelete?.(id)}
                className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={10} />
            </button>
        )}
    </div>
)

export const OutputNode = ({ id, data }: { id: string, data: { label: string, onDelete?: (id: string) => void } }) => (
    <div className="px-4 py-2 shadow-lg rounded-full bg-[#10b981] border-2 border-[#047857] min-w-[80px] group relative">
        <div className="text-center font-bold text-white lowercase text-sm">{data.label}</div>
        <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-white border-2 border-emerald-700"
        />
        {data.onDelete && (
            <button
                onClick={() => data.onDelete?.(id)}
                className="absolute -top-2 -right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Trash2 size={10} />
            </button>
        )}
    </div>
)
