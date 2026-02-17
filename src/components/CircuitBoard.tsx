import { useCallback, useRef } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    ReactFlowProvider,
    useReactFlow
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

const nodeTypes = {
    gateNode: GateNode,
    inputNode: InputNode,
    outputNode: OutputNode,
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
    const { project } = useReactFlow()

    const handleDelete = useCallback((id: string) => {
        const newNodes = nodes.filter(n => n.id !== id)
        const newEdges = edges.filter(e => e.source !== id && e.target !== id)
        onGraphChange(newNodes, newEdges, true)
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
            const newEdges = addEdge({ ...connection, animated: true, style: { stroke: '#94a3b8' } }, edges)
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
            className="w-full h-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-2xl"
        >
            <ReactFlow
                nodes={nodesWithCallbacks}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDragOver={onDragOver}
                onDrop={onDrop}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background color="#1e293b" gap={20} />
                <Controls />
                <MiniMap
                    nodeColor={(n) => {
                        if (n.type === 'inputNode') return '#3b82f6'
                        if (n.type === 'outputNode') return '#10b981'
                        return '#334155'
                    }}
                    maskColor="rgba(15, 23, 42, 0.7)"
                    className="bg-slate-900 border-slate-800"
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
