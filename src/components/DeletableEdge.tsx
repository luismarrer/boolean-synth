import React from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
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
    selected,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 8,
    })

    const onEdgeClick = (evt: React.MouseEvent) => {
        evt.stopPropagation()
        data?.onDelete?.(id)
    }

    const edgeStyle = {
        ...style,
        stroke: selected ? '#22D3EE' : style.stroke ?? '#38BDF8',
        strokeWidth: selected ? 2.5 : style.strokeWidth ?? 2,
        filter: selected
            ? 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.7))'
            : style.filter ?? 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))',
    }

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
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
                        <div
                            style={{
                                background: 'rgba(11, 18, 32, 0.9)',
                                border: '1px solid rgba(34, 211, 238, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontFamily: 'monospace',
                                color: '#22D3EE',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 0 8px rgba(34, 211, 238, 0.2)',
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                                marginBottom: '4px',
                            }}
                        >
                            {data.expression}
                        </div>
                    )}
                    <button
                        style={{
                            width: '18px',
                            height: '18px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EF4444',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'all 0.2s ease',
                            transform: 'scale(0.8)',
                        }}
                        className="edge-delete-btn"
                        onClick={onEdgeClick}
                        title="Delete Connection"
                    >
                        <X size={10} strokeWidth={3} />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    )
}
