import React, { useState, useCallback, useEffect, useMemo } from 'react'
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
    NodeChange,
    EdgeChange,
    Connection,
    Node,
    Edge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { GateNode, InputNode, OutputNode } from './Nodes'
import { graphToAST } from '../logic/generator'
import { stringifyAST } from '../logic/ast'

const nodeTypes = {
    gateNode: GateNode,
    inputNode: InputNode,
    outputNode: OutputNode,
}

interface CircuitBoardProps {
    nodes: Node[]
    edges: Edge[]
    onGraphChange: (nodes: Node[], edges: Edge[]) => void
}

const CircuitBoardInner = ({ nodes, edges, onGraphChange }: CircuitBoardProps) => {
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            const newNodes = applyNodeChanges(changes, nodes)
            onGraphChange(newNodes, edges)
        },
        [nodes, edges, onGraphChange]
    )

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            const newEdges = applyEdgeChanges(changes, edges)
            onGraphChange(nodes, newEdges)
        },
        [nodes, edges, onGraphChange]
    )

    const onConnect: OnConnect = useCallback(
        (connection) => {
            const newEdges = addEdge({ ...connection, animated: true, style: { stroke: '#94a3b8' } }, edges)
            onGraphChange(nodes, newEdges)
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
