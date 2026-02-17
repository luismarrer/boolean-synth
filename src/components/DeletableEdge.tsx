import React from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
} from 'reactflow'
import { X } from 'lucide-react'

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    })

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation()
        data?.onDelete?.(id)
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                    className="nodrag nopan group"
                >
                    {data?.expression && (
                        <div className="bg-slate-900/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-blue-400 backdrop-blur-sm shadow-xl pointer-events-none whitespace-nowrap mb-1">
                            {data.expression}
                        </div>
                    )}
                    <button
                        className="w-5 h-5 bg-red-500/80 hover:bg-red-500 border border-red-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer transition-all scale-75 hover:scale-100 opacity-60 hover:opacity-100"
                        onClick={onEdgeClick}
                        title="Delete Connection"
                    >
                        <X size={12} strokeWidth={3} />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    )
}
