import React, { useState, useEffect, useRef, useCallback } from "react";
import CrochetCanvas, { CrochetCanvasRef } from "./components/CrochetCanvas";
import Pattern2D, { Pattern2DRef } from "./components/Pattern2D";
import PatternControls from "./components/PatternControls";
import { Pattern, ConstructionMode } from "./types";
import ExportDropdown from "./components/ExportDropdown";
import LoadingScreen from "./components/LoadingScreen";
import Dialog from "./components/Dialog";
import ColorPicker from "./components/ColorPicker";
import { exportService } from "./services/exportService";
import { soundService } from "./services/soundService";
import { Toaster } from 'sonner';

const App: React.FC = () => {
  const [pattern, setPattern] = useState<Pattern>({
    name: "O Meu Projeto",
    mode: ConstructionMode.ROUND,
    rows: [],
  });

  const [patternVersion, setPatternVersion] = useState<number>(0);
  const [exportName, setExportName] = useState<string>("O Meu Projeto");

  const [activeView, setActiveView] = useState<"3d" | "2d">("3d");
  const [isLoading, setIsLoading] = useState(true);

  // Dialog state
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showDialog = (title: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setDialogState({ isOpen: true, title, message, type });
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

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
    // Simulate app initialization and hide loading screen after 1.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const rowStitchCounts = pattern.rows.map((r) => r.stitches.length);
  }, [pattern, totalStitches]);

  // Optimized color change handler with minimal re-renders
  const handleColorChange = useCallback((rowIndex: number, stitchIndex: number | null, color: string) => {
    setPattern(prevPattern => {
      const newPattern = { ...prevPattern };
      const newRows = [...newPattern.rows];
      const targetRow = { ...newRows[rowIndex] };
      
      if (stitchIndex === null) {
        // Apply color to entire row
        targetRow.stitches = targetRow.stitches.map(stitch => ({
          ...stitch,
          color
        }));
      } else {
        // Apply color to single stitch
        const newStitches = [...targetRow.stitches];
        newStitches[stitchIndex] = {
          ...newStitches[stitchIndex],
          color
        };
        targetRow.stitches = newStitches;
      }
      
      newRows[rowIndex] = targetRow;
      newPattern.rows = newRows;
      
      return newPattern;
    });
    // Increment version to force Three.js re-render
    setPatternVersion(v => v + 1);
  }, []);

  // Export functions
  const normalizeExportBaseName = (rawName: string, fallback: string) => {
    const trimmed = rawName.trim();
    const base = (trimmed || fallback || "padrao").trim();
    const cleaned = base
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
      .replace(/\s+/g, " ")
      .replace(/\.+$/g, "")
      .trim();
    return cleaned || "padrao";
  };

  const handleExport3D = (name: string) => {
    if (!canvasRef?.current) {
      showDialog(
        'Canvas 3D Indisponível',
        'O canvas 3D não está disponível. Por favor, certifica-te de que estás na vista 3D.',
        'error'
      );
      return;
    }
    const canvas = canvasRef.current.getCanvasElement();
    if (canvas) {
      const baseName = normalizeExportBaseName(name, pattern.name);
      exportService.exportCanvasAsPNG(
        canvas,
        `${baseName}-3d.png`
      );
      soundService.playConnect();
      showDialog(
        'Exportação Bem-sucedida',
        `A imagem 3D foi exportada como "${baseName}-3d.png".`,
        'success'
      );
    }
  };

  const handleExport2D = (name: string) => {
    if (!pattern2DRef?.current) {
      showDialog(
        'Padrão 2D Indisponível',
        'O padrão 2D não está disponível. Por favor, muda para a vista 2D primeiro.',
        'error'
      );
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      const baseName = normalizeExportBaseName(name, pattern.name);
      exportService.export2DAsPNG(
        svg,
        `${baseName}-2d.png`
      );
      soundService.playConnect();
      showDialog(
        'Exportação Bem-sucedida',
        `O padrão 2D foi exportado como "${baseName}-2d.png".`,
        'success'
      );
    }
  };

  const handleExport2DSVG = (name: string) => {
    if (!pattern2DRef?.current) {
      showDialog(
        'Padrão 2D Indisponível',
        'O padrão 2D não está disponível. Por favor, muda para a vista 2D primeiro.',
        'error'
      );
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      const baseName = normalizeExportBaseName(name, pattern.name);
      exportService.export2DAsSVG(
        svg,
        `${baseName}-2d.svg`
      );
      soundService.playConnect();
      showDialog(
        'Exportação Bem-sucedida',
        `O padrão 2D foi exportado como "${baseName}-2d.svg" (formato vetor).`,
        'success'
      );
    }
  };

  const handleExportJSON = (name: string) => {
    const baseName = normalizeExportBaseName(name, pattern.name);
    exportService.exportPatternAsJSON(
      pattern,
      `${baseName}.json`
    );
    soundService.playConnect();
    showDialog(
      'Exportação Bem-sucedida',
      `Os dados do padrão foram exportados como "${baseName}.json".`,
      'success'
    );
  };

  const handleExportCSV = (name: string) => {
    const baseName = normalizeExportBaseName(name, pattern.name);
    exportService.exportPatternAsCSV(
      pattern,
      `${baseName}.csv`
    );
    soundService.playConnect();
    showDialog(
      'Exportação Bem-sucedida',
      `Os dados do padrão foram exportados como "${baseName}.csv" para uso em Excel ou Sheets.`,
      'success'
    );
  };

  const handleExportPDF = async (name: string) => {
    if (!pattern2DRef?.current) {
      showDialog(
        'Padrão 2D Indisponível',
        'O padrão 2D não está disponível. Por favor, muda para a vista 2D primeiro.',
        'error'
      );
      return;
    }
    const svg = pattern2DRef.current.getSVGElement();
    if (svg) {
      const baseName = normalizeExportBaseName(name, pattern.name);
      try {
        await exportService.exportPatternAsPDF(
          svg,
          `${baseName}.pdf`
        );
        soundService.playConnect();
        showDialog(
          'Exportação Bem-sucedida',
          `O padrão foi exportado como "${baseName}.pdf" pronto para imprimir.`,
          'success'
        );
      } catch (error) {
        showDialog(
          'Erro na Exportação PDF',
          'Ocorreu um erro ao exportar o PDF. Certifica-te de que a biblioteca html2pdf.js está instalada.',
          'error'
        );
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-gray-900">
      <LoadingScreen isVisible={isLoading} />
      <Toaster position="top-right" richColors />
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
            exportName={exportName}
            onExportNameChange={setExportName}
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
                  .join("-")}-${patternVersion}`}
                pattern={pattern}
                version={patternVersion}
              />
              <ColorPicker pattern={pattern} onColorChange={handleColorChange} />
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
              <ColorPicker pattern={pattern} onColorChange={handleColorChange} />
            </div>
          )}
        </div>
      </main>

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

        {/* Dialog Component */}
        <Dialog
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          title={dialogState.title}
          message={dialogState.message}
          type={dialogState.type}
        />
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