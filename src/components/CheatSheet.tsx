import React from 'react';

export const CheatSheet: React.FC = () => {
    return (
        <div className="mt-3 space-y-1">
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">AND</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-blue-400 font-mono">ab</code>
            </div>
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">OR</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-emerald-400 font-mono">a+b</code>
            </div>
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">NOT</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-red-400 font-mono">a'</code>
            </div>
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">XOR</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-amber-400 font-mono">a^b</code>
            </div>
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">NAND</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-cyan-400 font-mono">(ab)'</code>
            </div>
            <div className="flex justify-between items-center text-xs p-1.5 hover:bg-white/5 rounded-lg">
                <span className="text-slate-500">NOR</span>
                <code className="bg-slate-800/50 px-1.5 py-0.5 rounded text-pink-400 font-mono">(a+b)'</code>
            </div>
            <p className="mt-4 pt-2 text-[10px] text-slate-500 border-t border-(--border-color)">
                * Support for multiple variables, parentheses, and implicit multiplication.
            </p>
        </div>
    );
};
