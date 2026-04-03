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
    { type: 'AND', icon: AndGate, color: '#22D3EE', label: 'AND' },
    { type: 'OR', icon: OrGate, color: '#22D3EE', label: 'OR' },
    { type: 'NOT', icon: NotGate, color: '#22D3EE', label: 'NOT' },
    { type: 'NAND', icon: NandGate, color: '#22D3EE', label: 'NAND' },
    { type: 'NOR', icon: NorGate, color: '#22D3EE', label: 'NOR' },
    { type: 'XOR', icon: XorGate, color: '#22D3EE', label: 'XOR' },
    { type: 'XNOR', icon: XnorGate, color: '#22D3EE', label: 'XNOR' },
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
                        className="flex flex-col items-center gap-2 p-3 bg-transparent border border-primary/30 rounded-xl cursor-grab hover:border-primary hover:shadow-(--glow-primary) transition-all active:scale-95 group"
                        draggable
                        onDragStart={(e) => onDragStart(e, 'gateNode', { label: comp.type, color: comp.color })}
                    >
                        <comp.icon size={32} color={comp.color} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-medium text-slate-400">{comp.label}</span>
                    </div>
                ))}
            </div>

            <div
                className="mt-4 flex flex-col items-center justify-center p-3 bg-transparent border border-(--border-color) rounded-xl cursor-grab hover:border-slate-500 transition-all active:scale-95 group"
                draggable
                onDragStart={(e) => onDragStart(e, 'inputNode', { label: 'A' })}
            >
                <div className="p-2 border border-slate-600 rounded-full mb-1">
                    <Type size={16} className="text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-300">Variable</span>
            </div>
        </div>
    )
}
