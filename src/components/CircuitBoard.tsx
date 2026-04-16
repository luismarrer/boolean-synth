import { useCallback, useEffect, useRef } from 'react'
import ReactFlow, {
    Controls,
    MiniMap,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    ReactFlowProvider,
    useReactFlow,
    useNodesInitialized
} from 'reactflow'
import type {
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    Node as RFNode,
    Edge as RFEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { GateNode, InputNode, OutputNode } from './Nodes'
import {
    AndGate,
    OrGate,
    NotGate,
    XorGate,
    NandGate,
    NorGate,
    XnorGate
} from './LogicGateSymbols'

import DeletableEdge from './DeletableEdge'

const nodeTypes = {
    gateNode: GateNode,
    inputNode: InputNode,
    outputNode: OutputNode,
}

const edgeTypes = {
    deletableEdge: DeletableEdge,
}

const getSymbolIcon = (type: string) => {
    switch (type) {
        case 'AND': return AndGate
        case 'OR': return OrGate
        case 'NOT': return NotGate
        case 'XOR': return XorGate
        case 'NAND': return NandGate
        case 'NOR': return NorGate
        case 'XNOR': return XnorGate
        default: return AndGate
    }
}

const getGateColor = (type: string) => {
    switch (type) {
        case 'AND': return '#3b82f6'
        case 'OR': return '#10b981'
        case 'NOT': return '#ef4444'
        case 'XOR': return '#f59e0b'
        case 'XNOR': return '#8b5cf6'
        case 'NAND': return '#06b6d4'
        case 'NOR': return '#ec4899'
        default: return '#3b82f6'
    }
}

interface CircuitBoardProps {
    nodes: RFNode[]
    edges: RFEdge[]
    onGraphChange: (nodes: RFNode[], edges: RFEdge[], isStructural: boolean) => void
}

const CircuitBoardInner = ({ nodes, edges, onGraphChange }: CircuitBoardProps) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null)
    const { project, fitView } = useReactFlow()
    const nodesInitialized = useNodesInitialized({ includeHiddenNodes: false })

    // Stable refs so our effect always reads the latest values without
    // needing them in the dependency array (which would cause re-runs on every render)
    const nodesRef = useRef(nodes)
    const edgesRef = useRef(edges)
    const hasInitializedRef = useRef(false)
    // Keep refs in sync on every render (runs before effects)
    useEffect(() => {
        nodesRef.current = nodes
        edgesRef.current = edges
    })

    // When React Flow finishes measuring all node handles:
    // 1. Fit the viewport so the circuit is fully visible
    // 2. Re-push edges through onGraphChange so the parent returns *new object refs*,
    //    which React Flow's controlled-mode sync detects as changed and re-routes the
    //    edge paths using the now-known handle positions.
    useEffect(() => {
        if (!nodesInitialized) {
            // Nodes changed (new expression typed) — allow re-init on next measurement
            hasInitializedRef.current = false
            return
        }
        if (hasInitializedRef.current) return
        hasInitializedRef.current = true

        fitView({ padding: 0.2, duration: 200 })

        if (edgesRef.current.length > 0) {
            onGraphChange(nodesRef.current, edgesRef.current, false)
        }
    }, [nodesInitialized, fitView, onGraphChange])

    const handleDelete = useCallback((id: string) => {
        const newNodes = nodes.filter(n => n.id !== id)
        const newEdges = edges.filter(e => e.source !== id && e.target !== id)
        onGraphChange(newNodes, newEdges, true)
    }, [nodes, edges, onGraphChange])

    const handleDeleteEdge = useCallback((id: string) => {
        const newEdges = edges.filter(e => e.id !== id)
        onGraphChange(nodes, newEdges, true)
    }, [nodes, edges, onGraphChange])

    const handleLabelChange = useCallback((id: string, label: string) => {
        const newNodes = nodes.map(n => {
            if (n.id === id) {
                return { ...n, data: { ...n.data, label } }
            }
            return n
        })
        onGraphChange(newNodes, edges, true)
    }, [nodes, edges, onGraphChange])

    // Update nodes with callbacks
    const nodesWithCallbacks = nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onDelete: handleDelete,
            onLabelChange: handleLabelChange
        }
    }))

    const edgesWithCallbacks = edges.map(edge => ({
        ...edge,
        type: 'deletableEdge',
        animated: false,
        style: {
            stroke: '#38BDF8',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))',
            ...edge.style,
        },
        data: {
            ...edge.data,
            onDelete: handleDeleteEdge
        }
    }))

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const isStructural = changes.some(c => c.type === 'remove' || c.type === 'reset')
            const newNodes = applyNodeChanges(changes, nodes)
            onGraphChange(newNodes, edges, isStructural)
        },
        [nodes, edges, onGraphChange]
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            const isStructural = changes.some(c => c.type === 'remove' || c.type === 'reset')
            const newEdges = applyEdgeChanges(changes, edges)
            onGraphChange(nodes, newEdges, isStructural)
        },
        [nodes, edges, onGraphChange]
    )

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const newEdges = addEdge({
                ...connection,
                type: 'deletableEdge',
                animated: false,
                style: {
                    stroke: '#38BDF8',
                    strokeWidth: 2,
                    filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.4))'
                }
            }, edges)
            onGraphChange(nodes, newEdges, true)
        },
        [nodes, edges, onGraphChange]
    )

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault()

            if (!reactFlowWrapper.current) return

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
            const dataStr = event.dataTransfer.getData('application/reactflow')

            if (!dataStr) return

            const { type, data } = JSON.parse(dataStr)

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            })

            const newNode: RFNode = {
                id: `${type}-${Date.now()}`,
                type,
                position,
                data: {
                    ...data,
                    icon: type === 'gateNode' ? getSymbolIcon(data.label) : undefined,
                    color: type === 'gateNode' ? getGateColor(data.label) : undefined,
                },
            }

            onGraphChange([...nodes, newNode], edges, true)
        },
        [project, nodes, edges, onGraphChange]
    )

    return (
        <div
            ref={reactFlowWrapper}
            className="w-full h-full relative rounded-xl overflow-hidden border border-(--border-color) shadow-2xl"
            style={{
                backgroundColor: 'var(--color-bg-main)',
                backgroundImage: `linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }}
        >
            <ReactFlow
                nodes={nodesWithCallbacks}
                edges={edgesWithCallbacks}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
            >
                {/* <Background color="rgba(255,255,255,0.05)" gap={20} /> */}
                <Controls />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === 'inputNode') return '#3b82f6'
                        if (n.type === 'outputNode') return '#10b981'
                        return '#334155'
                    }}
                    maskColor="rgba(11, 18, 32, 0.7)"
                    className="bg-bg-panel border-(--border-color)"
                />
            </ReactFlow>
        </div>
    )
}

export const CircuitBoard = (props: CircuitBoardProps) => (
    <ReactFlowProvider>
        <CircuitBoardInner {...props} />
    </ReactFlowProvider>
)
