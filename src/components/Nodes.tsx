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
    <div
        className="group relative flex items-center justify-center"
        style={{
            width: 52,
            height: 52,
            background: 'rgba(10, 25, 47, 0.85)',
            border: '2px solid #00e5ff',
            borderRadius: 4,
        }}
    >
        <input
            type="text"
            value={data.label}
            onChange={(e) => data.onLabelChange?.(id, e.target.value.toLowerCase())}
            className="bg-transparent text-center font-bold lowercase focus:outline-none w-full"
            style={{
                color: '#00e5ff',
                fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
                fontSize: 15,
                letterSpacing: '0.04em',
            }}
        />
        <Handle
            type="source"
            position={Position.Right}
            className="!w-3 !h-3 !bg-[#00e5ff] !border-2 !border-[#0a192f] !rounded-full"
            style={{ right: -7 }}
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
    <div
        className="group relative flex items-center justify-center"
        style={{
            width: 52,
            height: 52,
            background: 'rgba(10, 25, 47, 0.85)',
            border: '2px solid #00e5ff',
            borderRadius: 4,
        }}
    >
        <div
            className="text-center font-bold lowercase select-none"
            style={{
                color: '#00e5ff',
                fontFamily: "'JetBrains Mono', 'Fira Mono', monospace",
                fontSize: 13,
                letterSpacing: '0.04em',
            }}
        >
            {data.label}
        </div>
        <Handle
            type="target"
            position={Position.Left}
            className="!w-3 !h-3 !bg-[#00e5ff] !border-2 !border-[#0a192f] !rounded-full"
            style={{ left: -7 }}
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
