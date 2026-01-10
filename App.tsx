
import React, { useState } from 'react';
import CrochetCanvas from './components/CrochetCanvas';
import Pattern2D from './components/Pattern2D';
import PatternControls from './components/PatternControls';
import { Pattern, ConstructionMode } from './types';

const App: React.FC = () => {
  const [pattern, setPattern] = useState<Pattern>({
    name: "My Awesome Project",
    mode: ConstructionMode.ROUND,
    rows: []
  });

  const [activeView, setActiveView] = useState<'3d' | '2d'>('3d');

  const totalStitches = pattern.rows.reduce((sum, row) => sum + row.stitches.length, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900">
      {/* Sidebar - Controls */}
      <aside className="w-80 flex-shrink-0 z-20 shadow-2xl relative">
        <PatternControls pattern={pattern} setPattern={setPattern} />
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 relative bg-gray-100 flex flex-col">
        {/* View Toggle Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest mr-4">View Mode</span>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('3d')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === '3d' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                3D View
              </button>
              <button
                onClick={() => setActiveView('2d')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeView === '2d' ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                2D Chart
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeView === '3d' && (
            <div className="relative h-full w-full">
              <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">3D Render</div>
              <CrochetCanvas pattern={pattern} />
            </div>
          )}

          {activeView === '2d' && (
            <div className="relative h-full w-full">
              <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">2D Pattern Chart</div>
              <Pattern2D pattern={pattern} setPattern={setPattern} />
            </div>
          )}
        </div>

        {/* Stats Overlay (Bottom Right) */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto min-w-[180px]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">Stats</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Rows</span>
                <span className="text-xl text-indigo-600 font-black">{pattern.rows.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">Stitches</span>
                <span className="text-xl text-indigo-600 font-black">{totalStitches}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Pattern Feed */}
        <div className="absolute top-20 right-6 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto max-h-[300px] overflow-y-auto w-64 scrollbar-hide">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-tighter mb-2">Instructions</h3>
            <div className="space-y-1.5">
              {pattern.rows.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">Start your first row...</p>
              ) : (
                pattern.rows.map((row, idx) => (
                  <div key={row.id} className="text-[10px] border-l-2 border-indigo-400 pl-2 py-0.5 bg-gray-50/50">
                    <span className="font-black text-indigo-500">R{idx + 1}:</span> {summarizeRow(row)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper function to turn row stitches into text
function summarizeRow(row: any): string {
  if (row.stitches.length === 0) return "Empty";
  const counts: Record<string, number> = {};
  row.stitches.forEach((s: any) => {
    counts[s.type] = (counts[s.type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, count]) => `${count} ${type.toUpperCase()}`)
    .join(', ');
}

export default App;
