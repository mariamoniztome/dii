import React, { useState } from 'react';
import { Download, ChevronDown, Camera, FileJson, BarChart3, File, Image, FileType } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDropdownProps {
  exportName: string;
  onExportNameChange: (name: string) => void;
  onExport3D: (name: string) => void;
  onExport2D: (name: string) => void;
  onExport2DSVG: (name: string) => void;
  onExportJSON: (name: string) => void;
  onExportCSV: (name: string) => void;
  onExportPDF: (name: string) => void;
  activeView: '3d' | '2d';
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  exportName,
  onExportNameChange,
  onExport3D,
  onExport2D,
  onExport2DSVG,
  onExportJSON,
  onExportCSV,
  onExportPDF,
  activeView,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold border border-emerald-500 transition-all"
        title="Exportar Padrão"
      >
        <Download size={16} />
        <span>Exportar</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${showMenu ? 'rotate-180' : ''}`}
        />
      </button>

      {showMenu && (
        <div className="absolute z-[9999] top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-80">
          <div className="px-3 py-3 border-b border-gray-100 bg-white">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              Nome do ficheiro
            </label>
            <input
              type="text"
              value={exportName}
              onChange={(e) => onExportNameChange(e.target.value)}
              placeholder="Ex.: meu-padrao"
              className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Canvas 3D Exports */}
          <div className="border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50 flex items-center gap-2">
              <Camera size={14} />
              Canvas 3D {activeView === '3d' && <span className="text-emerald-600">● Ativo</span>}
            </p>
            <button
              onClick={() => {
                if (activeView === '3d') {
                  onExport3D(exportName);
                  setShowMenu(false);
                } else {
                  toast.warning('Muda para a Vista 3D', {
                    description: 'Esta exportação só está disponível na vista 3D.'
                  });
                }
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-start gap-2 hover:bg-blue-50 text-blue-600 cursor-pointer"
            >
              <Image size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Imagem PNG da Vista 3D</div>
                <div className="text-[10px] opacity-70">Captura do render 3D</div>
              </div>
            </button>
          </div>

          {/* Pattern 2D Exports */}
          <div className="border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50 flex items-center gap-2">
              <FileType size={14} />
              Padrão 2D {activeView === '2d' && <span className="text-emerald-600">● Ativo</span>}
            </p>
            <button
              onClick={() => {
                if (activeView === '2d') {
                  onExport2D(exportName);
                  setShowMenu(false);
                } else {
                  toast.warning('Muda para a Vista 2D', {
                    description: 'Esta exportação só está disponível na vista 2D.'
                  });
                }
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-start gap-2 hover:bg-purple-50 text-purple-600 cursor-pointer"
            >
              <Image size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Imagem PNG do Mapa 2D</div>
                <div className="text-[10px] opacity-70">Padrão em formato raster</div>
              </div>
            </button>
            <button
              onClick={() => {
                if (activeView === '2d') {
                  onExport2DSVG(exportName);
                  setShowMenu(false);
                } else {
                  toast.warning('Muda para a Vista 2D', {
                    description: 'Esta exportação só está disponível na vista 2D.'
                  });
                }
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-start gap-2 hover:bg-purple-50 text-purple-600 cursor-pointer"
            >
              <FileType size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Vetor SVG do Mapa 2D</div>
                <div className="text-[10px] opacity-70">Escalável, editável</div>
              </div>
            </button>
            <button
              onClick={() => {
                if (activeView === '2d') {
                  onExportPDF(exportName);
                  setShowMenu(false);
                } else {
                  toast.warning('Muda para a Vista 2D', {
                    description: 'Esta exportação só está disponível na vista 2D.'
                  });
                }
              }}
              className="w-full text-left px-3 py-2 text-sm font-medium transition-colors flex items-start gap-2 hover:bg-purple-50 text-purple-600 cursor-pointer"
            >
              <File size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Documento PDF</div>
                <div className="text-[10px] opacity-70">Pronto para imprimir</div>
              </div>
            </button>
          </div>

          {/* Data Exports */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50">
              Dados do Padrão
            </p>
            <button
              onClick={() => {
                onExportJSON(exportName);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-600 text-sm font-medium transition-colors flex items-start gap-2"
            >
              <FileJson size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Ficheiro JSON</div>
                <div className="text-[10px] opacity-70">Dados estruturados completos</div>
              </div>
            </button>
            <button
              onClick={() => {
                onExportCSV(exportName);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-600 text-sm font-medium transition-colors flex items-start gap-2"
            >
              <BarChart3 size={16} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">Tabela CSV</div>
                <div className="text-[10px] opacity-70">Para Excel/Sheets</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
