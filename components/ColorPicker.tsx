import React, { useState, useCallback, memo } from 'react';
import { Pattern, Row, StitchInstance } from '../types';
import { soundService } from '../services/soundService';

interface ColorPickerProps {
  pattern: Pattern;
  onColorChange: (rowIndex: number, stitchIndex: number | null, color: string) => void;
}

interface SelectedItem {
  type: 'row' | 'stitch';
  rowIndex: number;
  stitchIndex?: number;
  currentColor: string;
}

const ColorPicker: React.FC<ColorPickerProps> = memo(({ pattern, onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [tempColor, setTempColor] = useState('#f0e6dc');

  const handleIconClick = useCallback(() => {
    setIsOpen(prev => !prev);
    if (!isOpen && pattern.rows.length > 0) {
      // Default to last row when opening
      const lastRowIndex = pattern.rows.length - 1;
      const lastRow = pattern.rows[lastRowIndex];
      setSelectedItem({
        type: 'row',
        rowIndex: lastRowIndex,
        currentColor: lastRow.stitches[0]?.color || '#f0e6dc'
      });
      setTempColor(lastRow.stitches[0]?.color || '#f0e6dc');
    }
  }, [isOpen, pattern.rows]);

  const handleRowSelect = useCallback((rowIndex: number) => {
    const row = pattern.rows[rowIndex];
    const rowColor = row.stitches[0]?.color || '#f0e6dc';
    setSelectedItem({
      type: 'row',
      rowIndex,
      currentColor: rowColor
    });
    setTempColor(rowColor);
  }, [pattern.rows]);

  const handleStitchSelect = useCallback((rowIndex: number, stitchIndex: number) => {
    const stitch = pattern.rows[rowIndex].stitches[stitchIndex];
    setSelectedItem({
      type: 'stitch',
      rowIndex,
      stitchIndex,
      currentColor: stitch.color || '#f0e6dc'
    });
    setTempColor(stitch.color || '#f0e6dc');
  }, [pattern.rows]);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value);
  }, []);

  const applyColor = useCallback(() => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'row') {
      // Apply color to all stitches in the row
      onColorChange(selectedItem.rowIndex, null, tempColor);
    } else {
      // Apply color to single stitch
      onColorChange(selectedItem.rowIndex, selectedItem.stitchIndex!, tempColor);
    }
    
    // Play sound feedback
    soundService.playConnect();
    
    // Update the current color to reflect the change
    setSelectedItem(prev => prev ? { ...prev, currentColor: tempColor } : null);
  }, [selectedItem, tempColor, onColorChange]);

  const presetColors = [
    '#f0e6dc', // Natural
    '#ff9999', // Coral
    '#99ccff', // Sky Blue
    '#ccff99', // Mint
    '#ffcc99', // Peach
    '#ff99cc', // Pink
    '#99ffcc', // Seafoam
    '#ccccff', // Lavender
    '#ffffff', // White
    '#000000', // Black
  ];

  if (pattern.rows.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-4 flex flex-col items-end gap-2 pointer-events-auto z-40">
      {/* Color Picker Panel */}
      {isOpen && (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl p-4 w-64 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              Seletor de Cor
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selection Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-3">
            <button
              onClick={() => selectedItem && handleRowSelect(selectedItem.rowIndex)}
              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                selectedItem?.type === 'row'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Carreira Inteira
            </button>
            <button
              onClick={() => selectedItem && selectedItem.type === 'row' && pattern.rows[selectedItem.rowIndex].stitches.length > 0 && handleStitchSelect(selectedItem.rowIndex, 0)}
              className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                selectedItem?.type === 'stitch'
                  ? 'bg-white shadow text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ponto Individual
            </button>
          </div>

          {/* Row Selector */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">
              Carreira:
            </label>
            <select
              value={selectedItem?.rowIndex ?? 0}
              onChange={(e) => handleRowSelect(parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {pattern.rows.map((row, idx) => (
                <option key={row.id} value={idx}>
                  R{idx + 1} ({row.stitches.length} pontos)
                </option>
              ))}
            </select>
          </div>

          {/* Stitch Selector (only show when stitch mode is active) */}
          {selectedItem?.type === 'stitch' && (
            <div className="mb-3">
              <label className="text-xs text-gray-600 font-semibold mb-1 block">
                Ponto:
              </label>
              <select
                value={selectedItem.stitchIndex ?? 0}
                onChange={(e) => handleStitchSelect(selectedItem.rowIndex, parseInt(e.target.value))}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {pattern.rows[selectedItem.rowIndex].stitches.map((stitch, idx) => (
                  <option key={stitch.id} value={idx}>
                    Ponto {idx + 1} ({stitch.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current Color Display */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">
              Cor Atual:
            </label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-gray-300"
                style={{ backgroundColor: tempColor }}
              />
              <span className="text-xs text-gray-500 font-mono">{tempColor}</span>
            </div>
          </div>

          {/* Color Picker Input */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-1 block">
              Nova Cor:
            </label>
            <input
              type="color"
              value={tempColor}
              onChange={handleColorChange}
              className="w-full h-10 border border-gray-200 rounded-md cursor-pointer"
            />
          </div>

          {/* Preset Colors */}
          <div className="mb-3">
            <label className="text-xs text-gray-600 font-semibold mb-2 block">
              Cores Rápidas:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTempColor(color)}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    tempColor === color ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyColor}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
          >
            Aplicar Cor
          </button>
        </div>
      )}

      {/* Icon Button */}
      <button
        onClick={handleIconClick}
        className={`p-3 rounded-lg shadow-lg transition-all ${
          isOpen
            ? 'bg-indigo-600 text-white'
            : 'bg-white/80 backdrop-blur-md text-indigo-600 hover:bg-indigo-50'
        } border border-gray-200`}
        title="Seletor de Cor"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
      </button>
    </div>
  );
});

ColorPicker.displayName = 'ColorPicker';

export default ColorPicker;
