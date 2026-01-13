import React, { useState } from 'react';
import { Download, ChevronDown, Camera, FileJson, BarChart3, File } from 'lucide-react';

interface ExportDropdownProps {
  onExport3D: () => void;
  onExport2D: () => void;
  onExport2DSVG: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExport3D,
  onExport2D,
  onExport2DSVG,
  onExportJSON,
  onExportCSV,
  onExportPDF,
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
        <div className="absolute z-[9999] top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-56">
          {/* Canvas 3D Exports */}
          <div className="border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50">
              Canvas 3D
            </p>
            <button
              onClick={() => {
                onExport3D();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-blue-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Camera size={16} /> Exportar como PNG
            </button>
          </div>

          {/* Pattern 2D Exports */}
          <div className="border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50">
              Padrão 2D
            </p>
            <button
              onClick={() => {
                onExport2D();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-purple-50 text-purple-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileJson size={16} /> PNG
            </button>
            <button
              onClick={() => {
                onExport2DSVG();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-purple-50 text-purple-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileJson size={16} /> SVG
            </button>
          </div>

          {/* Data Exports */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 px-3 py-2 uppercase tracking-wider bg-gray-50">
              Dados
            </p>
            <button
              onClick={() => {
                onExportJSON();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileJson size={16} /> JSON
            </button>
            <button
              onClick={() => {
                onExportCSV();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <BarChart3 size={16} /> CSV
            </button>
            <button
              onClick={() => {
                onExportPDF();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-orange-50 text-orange-600 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <File size={16} /> PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
