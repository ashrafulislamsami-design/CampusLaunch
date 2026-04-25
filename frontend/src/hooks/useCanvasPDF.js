import { useCallback, useState } from 'react';

// Heavy libs (html2canvas + jspdf) are imported lazily so they only ship
// when the user actually clicks "Download PDF".
export default function useCanvasPDF() {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = useCallback(async ({ teamName = 'Team', elementId = 'canvas-pdf-target' } = {}) => {
    setExporting(true);
    try {
      const [{ default: html2canvas }, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Canvas target element not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
      pdf.setFontSize(20);
      pdf.text('Business Model Canvas', 15, 15);
      pdf.setFontSize(12);
      pdf.text(`Team: ${teamName}`, 15, 22);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 28);

      const imgWidth = pdf.internal.pageSize.getWidth() - 30;
      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 15, 35, imgWidth, imgHeight);

      const safeName = teamName.replace(/[^a-z0-9-_]+/gi, '_');
      pdf.save(`${safeName}-BusinessModelCanvas-${new Date().toISOString().slice(0, 10)}.pdf`);
      return true;
    } finally {
      setExporting(false);
    }
  }, []);

  const exportToPNG = useCallback(async ({ teamName = 'Team', elementId = 'canvas-pdf-target' } = {}) => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Canvas target element not found');
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      const safeName = teamName.replace(/[^a-z0-9-_]+/gi, '_');
      link.download = `${safeName}-BusinessModelCanvas-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      return true;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportToPDF, exportToPNG, exporting };
}
