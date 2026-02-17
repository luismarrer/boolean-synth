import React from 'react'
import {
    AndGate,
    OrGate,
    NotGate,
    XorGate,
    NandGate,
    NorGate,
    XnorGate
} from './LogicGateSymbols'
import { Type } from 'lucide-react'

const components = [
    { type: 'AND', icon: AndGate, color: '#3b82f6', label: 'AND' },
    { type: 'OR', icon: OrGate, color: '#10b981', label: 'OR' },
    { type: 'NOT', icon: NotGate, color: '#ef4444', label: 'NOT' },
    { type: 'XOR', icon: XorGate, color: '#f59e0b', label: 'XOR' },
    { type: 'NAND', icon: NandGate, color: '#06b6d4', label: 'NAND' },
    { type: 'NOR', icon: NorGate, color: '#ec4899', label: 'NOR' },
    { type: 'XNOR', icon: XnorGate, color: '#8b5cf6', label: 'XNOR' },
]

export const ComponentLibrary = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string, data: any) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, data }))
        event.dataTransfer.effectAllowed = 'move'
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Gates
            </h3>
            <div className="grid grid-cols-2 gap-3">
                {components.map((comp) => (
                    <div
                        key={comp.type}
                        className="flex flex-col items-center gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-grab hover:border-slate-600 transition-all active:scale-95 group"
                        draggable
                        onDragStart={(e) => onDragStart(e, 'gateNode', { label: comp.type, color: comp.color })}
                    >
                        <comp.icon size={32} color={comp.color} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium text-slate-400">{comp.label}</span>
                    </div>
                ))}
            </div>

            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-6 mb-4">
                Inputs
            </h3>
            <div
                className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-grab hover:border-slate-600 transition-all active:scale-95 group"
                draggable
                onDragStart={(e) => onDragStart(e, 'inputNode', { label: 'A' })}
            >
                <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Type size={20} className="text-blue-400" />
                </div>
                <span className="text-xs font-medium text-slate-300">Variable</span>
            </div>
        </div>
    )
}
