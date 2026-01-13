import React, { useState, useEffect, useRef } from "react";
import CrochetCanvas, { CrochetCanvasRef } from "./components/CrochetCanvas";
import Pattern2D, { Pattern2DRef } from "./components/Pattern2D";
import PatternControls from "./components/PatternControls";
import { Pattern, ConstructionMode } from "./types";
import ExportDropdown from "./components/ExportDropdown";
import { exportService } from "./services/exportService";
import { soundService } from "./services/soundService";

const App: React.FC = () => {
  const [pattern, setPattern] = useState<Pattern>({
    name: "O Meu Projeto",
    mode: ConstructionMode.ROUND,
    rows: [],
  });

  const [activeView, setActiveView] = useState<"3d" | "2d">("3d");

  // Create refs for canvas components
  const canvasRef = useRef<CrochetCanvasRef>(null);
  const pattern2DRef = useRef<Pattern2DRef>(null);

  const totalStitches = pattern.rows.reduce(
    (sum, row) => sum + row.stitches.length,
    0
  );

  // Force default view to 3D on mount (covers Fast Refresh persisting a prior tab)
  useEffect(() => {
    if (activeView !== "3d") {
      setActiveView("3d");
    }
  }, []);

  useEffect(() => {
    const rowStitchCounts = pattern.rows.map((r) => r.stitches.length);
  }, [pattern, totalStitches]);

  // Export functions
  const handleExport3D = () => {
    if (!canvasRef?.current) {
      alert("Canvas 3D não está disponível");
      return;
    }
    const canvas = canvasRef.current.getCanvasElement();
    if (canvas) {
      exportService.exportCanvasAsPNG(
        canvas,
        `padrão-3d-${new Date().toISOString().split("T")[0]}.png`
      );
      soundService.playConnect();
    }
  };

  const handleExport2D = () => {
    if (!pattern2DRef?.current) {
      alert("Padrão 2D não está disponível");
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      exportService.export2DAsPNG(
        svg,
        `padrão-2d-${new Date().toISOString().split("T")[0]}.png`
      );
      soundService.playConnect();
    }
  };

  const handleExport2DSVG = () => {
    if (!pattern2DRef?.current) {
      alert("Padrão 2D não está disponível");
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      exportService.export2DAsSVG(
        svg,
        `padrão-2d-${new Date().toISOString().split("T")[0]}.svg`
      );
      soundService.playConnect();
    }
  };

  const handleExportJSON = () => {
    exportService.exportPatternAsJSON(
      pattern,
      `padrão-${new Date().toISOString().split("T")[0]}.json`
    );
    soundService.playConnect();
  };

  const handleExportCSV = () => {
    exportService.exportPatternAsCSV(
      pattern,
      `padrão-${new Date().toISOString().split("T")[0]}.csv`
    );
    soundService.playConnect();
  };

  const handleExportPDF = async () => {
    if (!pattern2DRef?.current) {
      alert("Padrão 2D não está disponível");
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      await exportService.exportPatternAsPDF(
        svg,
        `padrão-${new Date().toISOString().split("T")[0]}.pdf`
      );
      soundService.playConnect();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900">
      {/* Sidebar - Controls */}
      <aside className="w-80 flex-shrink-0 z-20 shadow-2xl relative">
        <PatternControls
          pattern={pattern}
          setPattern={setPattern}
          canvasRef={canvasRef}
          pattern2DRef={pattern2DRef}
        />
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 relative bg-gray-100 flex flex-col">
        {/* View Toggle Bar */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Modo de Visualização
            </span>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveView("3d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeView === "3d"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Vista 3D
              </button>
              <button
                onClick={() => setActiveView("2d")}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  activeView === "2d"
                    ? "bg-white shadow text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Mapa 2D
              </button>
            </div>
          </div>
          <ExportDropdown
            onExport3D={handleExport3D}
            onExport2D={handleExport2D}
            onExport2DSVG={handleExport2DSVG}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeView === "3d" && (
            <div className="relative h-full w-full">
              <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                Render 3D
              </div>
              <CrochetCanvas
                ref={canvasRef}
                key={`${pattern.mode}-${pattern.rows.length}-${pattern.rows
                  .map((r) => r.stitches.length)
                  .join("-")}`}
                pattern={pattern}
              />
            </div>
          )}

          {activeView === "2d" && (
            <div className="relative h-full w-full">
              <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                Mapa de Padrão 2D
              </div>
              <Pattern2D
                ref={pattern2DRef}
                pattern={pattern}
                setPattern={setPattern}
              />
            </div>
          )}
        </div>
      </main>

      <div className="absolute bottom-6 left-6 flex flex-col gap-2 pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto min-w-[180px]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-1">
              Estatísticas
            </h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  Carreiras
                </span>
                <span className="text-xl text-indigo-600 font-black">
                  {pattern.rows.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase">
                  Pontos
                </span>
                <span className="text-xl text-indigo-600 font-black">
                  {totalStitches}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Pattern Feed */}
        <div className="absolute top-20 right-6 pointer-events-none z-5">
          <div className="bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-auto max-h-[300px] overflow-y-auto w-64 scrollbar-hide">
            <h3 className="text-xs font-black text-gray-700 uppercase tracking-tighter mb-2">
              Instruções
            </h3>
            <div className="space-y-1.5">
              {pattern.rows.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">
                  Começa a tua primeira carreira...
                </p>
              ) : (
                pattern.rows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="text-[10px] border-l-2 border-indigo-400 pl-2 py-0.5 bg-gray-50/50"
                  >
                    <span className="font-black text-indigo-500">
                      R{idx + 1}:
                    </span>{" "}
                    {summarizeRow(row)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

// Helper function to turn row stitches into text
function summarizeRow(row: any): string {
  if (row.stitches.length === 0) return "Vazia";
  const counts: Record<string, number> = {};
  row.stitches.forEach((s: any) => {
    counts[s.type] = (counts[s.type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, count]) => `${count} ${type.toUpperCase()}`)
    .join(", ");
}

export default App;