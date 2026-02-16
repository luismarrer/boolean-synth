import { useCallback } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    ReactFlowProvider
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

const nodeTypes = {
    gateNode: GateNode,
    inputNode: InputNode,
    outputNode: OutputNode,
}

interface CircuitBoardProps {
    nodes: RFNode[]
    edges: RFEdge[]
    onGraphChange: (nodes: RFNode[], edges: RFEdge[], isStructural: boolean) => void
}

const CircuitBoardInner = ({ nodes, edges, onGraphChange }: CircuitBoardProps) => {
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

    return (
        <div className="w-full h-full bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
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
