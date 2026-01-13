import React, { useState, useEffect, useRef } from "react";
import {
  Pattern,
  Row,
  StitchType,
  ConstructionMode,
  StitchInstance,
} from "../types";
import { STITCH_DESCRIPTIONS, STITCH_TYPE_COLORS } from "../constants.tsx";
import { serialService } from "../services/serialService";
import { soundService } from "../services/soundService";
import { exportService } from "../services/exportService";
import { CrochetCanvasRef } from "./CrochetCanvas";
import { Pattern2DRef } from "./Pattern2D";
import ExportDropdown from "./ExportDropdown";
import {
  Download,
  Camera,
  FileJson,
  BarChart3,
  File,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";

interface PatternControlsProps {
  pattern: Pattern;
  setPattern: React.Dispatch<React.SetStateAction<Pattern>>;
  canvasRef?: React.RefObject<CrochetCanvasRef>;
  pattern2DRef?: React.RefObject<Pattern2DRef>;
}

const PatternControls: React.FC<PatternControlsProps> = ({
  pattern,
  setPattern,
  canvasRef,
  pattern2DRef,
}) => {
  const [selectedStitch, setSelectedStitch] = useState<StitchType>(
    StitchType.SC
  );
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Hardware State
  const [isConnected, setIsConnected] = useState(false);
  const [lastRemoteStitch, setLastRemoteStitch] = useState<string | null>(null);
  const [sensorPreview, setSensorPreview] = useState<string | null>(null);

  const addRow = () => {
    const newRow: Row = {
      id: Math.random().toString(36).substr(2, 9),
      stitches: [],
    };
    setPattern((prev) => ({ ...prev, rows: [...prev.rows, newRow] }));
    soundService.playConnect();
  };

  const addStitchToCurrentRow = (typeToUse?: StitchType) => {
    const type = typeToUse || selectedStitch;
    setPattern((prev) => {
      const rows = [...prev.rows];
      if (rows.length === 0) {
        rows.push({
          id: Math.random().toString(36).substr(2, 9),
          stitches: [],
        });
      }

      const lastRowIndex = rows.length - 1;
      
      const newStitch: StitchInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        color: STITCH_TYPE_COLORS[type],
      };

      rows[lastRowIndex] = {
        ...rows[lastRowIndex],
        stitches: [...rows[lastRowIndex].stitches, newStitch],
      };

      return { ...prev, rows };
    });

    // Play audio cue for stitch action
    soundService.playStitch(type);
  };

  const handleConnect = async () => {
    if (isConnected) {
      await serialService.disconnect();
      setIsConnected(false);
      return;
    }

    const success = await serialService.requestPort();
    if (success) {
      setIsConnected(true);
      soundService.playConnect();
      serialService.startListening((cmd) => {
        // Handle "preview:sc" format for KS0031 Potentiometer
        if (cmd.startsWith("preview:")) {
          const pType = cmd.split(":")[1] as StitchType;
          if (Object.values(StitchType).includes(pType)) {
            setSensorPreview(pType);
            setSelectedStitch(pType);
          }
          return;
        }

        // Handle direct stitch trigger for KS0012 Touch
        const mappedType = Object.values(StitchType).find((t) => t === cmd);
        if (mappedType) {
          addStitchToCurrentRow(mappedType as StitchType);
          setLastRemoteStitch(mappedType);
          setTimeout(() => setLastRemoteStitch(null), 800);
        }
      });
    }
  };

  const removeLastStitch = () => {
    if (pattern.rows.length === 0) return;
    const lastRowIndex = pattern.rows.length - 1;
    const lastRow = pattern.rows[lastRowIndex];
    if (lastRow.stitches.length === 0) {
      setPattern((prev) => ({ ...prev, rows: prev.rows.slice(0, -1) }));
      return;
    }
    const newRows = [...pattern.rows];
    newRows[lastRowIndex] = {
      ...lastRow,
      stitches: lastRow.stitches.slice(0, -1),
    };
    setPattern((prev) => ({ ...prev, rows: newRows }));
  };



  return (
    <div
      className="flex flex-col h-full bg-white border-r border-gray-200 overflow-y-auto p-4 space-y-6 shadow-xl"
      style={
        {
          scrollbarWidth: "thin",
          scrollbarColor: "#818cf8 #f1f5f9",
        } as React.CSSProperties & {
          scrollbarWidth?: string;
          scrollbarColor?: string;
        }
      }
    >
      <style>{`
        .flex.flex-col.h-full::-webkit-scrollbar {
          width: 8px;
        }
        .flex.flex-col.h-full::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .flex.flex-col.h-full::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #818cf8 0%, #6366f1 100%);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        .flex.flex-col.h-full::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
        }
      `}</style>
      <div>
        <h1 className="text-2xl font-bold text-indigo-800 mb-1">
          Crochet Híbrido
        </h1>
      </div>

      {/* Advanced Sensor Hook Connection */}
      <section className="bg-slate-900 rounded-2xl p-4 text-white min-h-52 shadow-2xl relative overflow-hidden border border-slate-700">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                Modo de Sensores Avançado
              </h3>
              <span className="text-[9px] text-slate-500 font-bold">
                ADXL345 (Movimento) + Sensor de Toque
              </span>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected
                  ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse"
                  : "bg-slate-700"
              }`}
            />
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-[10px] bg-slate-800/50 p-2 rounded-lg border border-slate-700">
              <span className="text-slate-400">Seletor (Pot)</span>
              <span
                className={`font-mono ${
                  sensorPreview ? "text-amber-400" : "text-slate-600"
                }`}
              >
                {sensorPreview?.toUpperCase() || "---"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] bg-slate-800/50 p-2 rounded-lg border border-slate-700">
              <span className="text-slate-400">Ação (Toque)</span>
              <span
                className={`font-mono ${
                  lastRemoteStitch ? "text-green-400" : "text-slate-600"
                }`}
              >
                {lastRemoteStitch ? "ACIONADO!" : "A AGUARDAR..."}
              </span>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all border shadow-lg ${
              isConnected
                ? "bg-rose-500/10 border-rose-500/50 text-rose-400 hover:bg-rose-500/20"
                : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 hover:-translate-y-0.5"
            }`}
          >
            {isConnected
              ? "Parar Sincronização"
              : "Iniciar Ligação aos Sensores"}
          </button>
        </div>

        {/* Animated grid background for sensor panel */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "10px 10px",
          }}
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Construção
        </h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() =>
              setPattern((p) => ({ ...p, mode: ConstructionMode.FLAT }))
            }
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              pattern.mode === ConstructionMode.FLAT
                ? "bg-white shadow text-indigo-600"
                : "text-gray-500"
            }`}
          >
            Carreiras Planas
          </button>
          <button
            onClick={() =>
              setPattern((p) => ({ ...p, mode: ConstructionMode.ROUND }))
            }
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              pattern.mode === ConstructionMode.ROUND
                ? "bg-white shadow text-indigo-600"
                : "text-gray-500"
            }`}
          >
            Em Círculo
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Biblioteca de Pontos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(StitchType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedStitch(type)}
              className={`p-2 text-xs border rounded-lg flex flex-col items-center justify-center transition-all ${
                selectedStitch === type
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 scale-[1.02] shadow-sm"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span className="font-bold uppercase">{type}</span>
              {/* <span className="text-[10px] text-gray-400 capitalize">{type === 'inc' ? 'Aumento' : type === 'dec' ? 'Diminuição' : 'Básico'}</span> */}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500 bg-gray-50 p-2 rounded italic border-l-2 border-indigo-200">
          {STITCH_DESCRIPTIONS[selectedStitch]}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Controlo Manual
        </h3>

        <button
          onClick={addRow}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all font-bold text-sm active:scale-95"
        >
          Nova Carreira
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => addStitchToCurrentRow()}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200 transition-colors"
          >
            Adicionar {selectedStitch.toUpperCase()} manualmente
          </button>

          <button
            onClick={removeLastStitch}
            className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-100 transition-colors"
          >
            Desfazer Último
          </button>
        </div>
      </section>
    </div>
  );
};

export default PatternControls;