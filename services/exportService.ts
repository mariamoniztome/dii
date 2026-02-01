import { Pattern } from '../types';

/**
 * Export service for crochet patterns
 * Provides methods to export canvas and pattern data in various formats
 */
export const exportService = {
  /**
   * Export 3D canvas as PNG image
   * Requires canvas element from Three.js renderer
   */
  exportCanvasAsPNG: (canvasElement: HTMLCanvasElement, filename: string = 'crochet-3d.png') => {
    const link = document.createElement('a');
    link.href = canvasElement.toDataURL('image/png');
    link.download = filename;
    link.click();
  },

  /**
   * Export 3D canvas as JPEG image
   */
  exportCanvasAsJPEG: (canvasElement: HTMLCanvasElement, filename: string = 'crochet-3d.jpg', quality: number = 0.9) => {
    const link = document.createElement('a');
    link.href = canvasElement.toDataURL('image/jpeg', quality);
    link.download = filename;
    link.click();
  },

  /**
   * Export 2D pattern as PNG image
   */
  export2DAsPNG: (svgElement: SVGSVGElement, filename: string = 'crochet-pattern.png') => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = svgElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = filename;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  },

  /**
   * Export 2D pattern as SVG (vector format)
   */
  export2DAsSVG: (svgElement: SVGSVGElement, filename: string = 'crochet-pattern.svg') => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Export pattern data as JSON
   */
  exportPatternAsJSON: (pattern: Pattern, filename: string = 'crochet-pattern.json') => {
    const dataStr = JSON.stringify(pattern, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Export pattern data as CSV (suitable for spreadsheets)
   */
  exportPatternAsCSV: (pattern: Pattern, filename: string = 'crochet-pattern.csv') => {
    let csv = 'Row,Stitch Number,Stitch Type,Color\n';
    
    pattern.rows.forEach((row, rowIndex) => {
      row.stitches.forEach((stitch, stitchIndex) => {
        csv += `${rowIndex + 1},${stitchIndex + 1},${stitch.type},"${stitch.color}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Export pattern as PDF using html2pdf library
   */
  exportPatternAsPDF: async (svgElement: SVGSVGElement, patternName: string = 'crochet-pattern.pdf') => {
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = document.createElement('div');
    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    element.appendChild(clonedSvg);
    element.style.padding = '20px';
    element.style.backgroundColor = 'white';
    
    const opt = {
      margin: 10,
      filename: patternName,
      image: { type: 'png' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
  },

  /**
   * Copy canvas content to clipboard as image
   */
  copyCanvasToClipboard: async (canvasElement: HTMLCanvasElement) => {
    try {
      canvasElement.toBlob(blob => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
        }
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }
};
