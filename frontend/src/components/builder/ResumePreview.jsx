import React, { useRef, useEffect, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Check,
  Loader2,
  Target,
  FileText,
  Eye,
  Printer
} from "lucide-react";
import { generateResumePDF } from "../../utils/pdfGenerator";

/* ── Resume Studio Preview Canvas ──
   Provides an interactive, centered A4 canvas with dynamic auto-scaling,
   floating glassmorphism zoom controls, and a full-screen preview modal. */

const ResumePreview = ({ data, customization, TemplateComponent, onAnalyze }) => {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(0.55);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);

  // Auto-fit initial zoom on mount & container resize
  useEffect(() => {
    const handleAutoFit = () => {
      if (containerRef.current) {
        const availableW = containerRef.current.clientWidth - 48;
        // Standard A4 width in px is ~794px
        const fitScale = Math.min(Math.max(availableW / 794, 0.35), 0.85);
        setZoomScale(parseFloat(fitScale.toFixed(2)));
      }
    };
    handleAutoFit();
    window.addEventListener("resize", handleAutoFit);
    return () => window.removeEventListener("resize", handleAutoFit);
  }, []);

  const handleExportPDF = async () => {
    setDownloadingPdf(true);
    try {
      const pdfBytes = await generateResumePDF(data, customization);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(data?.personalInfo?.fullName || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadedPdf(true);
      setTimeout(() => setDownloadedPdf(false), 2500);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(`Failed to generate PDF: ${err.message || err}.`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* ── Scrollable A4 Canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-8 flex justify-center items-start custom-scrollbar relative z-10"
      >
        <div
          ref={previewRef}
          id="resume-printable-area"
          className="bg-white transition-all duration-200 origin-top shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/10 rounded-sm"
          style={{
            width: "210mm",
            minHeight: "297mm",
            transform: `scale(${zoomScale})`,
            marginBottom: `${-(1 - zoomScale) * 1123 + 40}px`,
          }}
        >
          {TemplateComponent && (
            <TemplateComponent data={data} customization={customization} />
          )}
        </div>
      </div>

      {/* ── Floating Studio Zoom Controls ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-lg text-xs">
        {/* Zoom Out */}
        <button
          onClick={() => setZoomScale((z) => Math.max(0.3, parseFloat((z - 0.05).toFixed(2))))}
          title="Zoom Out"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Zoom % */}
        <span className="font-mono text-[11px] font-bold min-w-[36px] text-center text-slate-800 dark:text-slate-200">
          {Math.round(zoomScale * 100)}%
        </span>

        {/* Zoom In */}
        <button
          onClick={() => setZoomScale((z) => Math.min(1.2, parseFloat((z + 0.05).toFixed(2))))}
          title="Zoom In"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Fit Preset */}
        <button
          onClick={() => {
            if (containerRef.current) {
              const availableW = containerRef.current.clientWidth - 48;
              const fitScale = Math.min(Math.max(availableW / 794, 0.35), 0.85);
              setZoomScale(parseFloat(fitScale.toFixed(2)));
            } else {
              setZoomScale(0.55);
            }
          }}
          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Fit
        </button>

        {/* 75% Preset */}
        <button
          onClick={() => setZoomScale(0.75)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
            zoomScale === 0.75
              ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          75%
        </button>

        {/* 100% Preset */}
        <button
          onClick={() => setZoomScale(1.0)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
            zoomScale === 1.0
              ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          100%
        </button>

        <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Fullscreen Modal Toggle */}
        <button
          onClick={() => setIsFullscreen(true)}
          title="Open Fullscreen Preview"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Fullscreen Preview Modal ── */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold">Fullscreen Preview</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={downloadingPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadingPdf ? "Generating..." : "Download PDF"}</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar">
            <div
              className="bg-white shadow-2xl rounded-sm my-auto"
              style={{ width: "210mm", minHeight: "297mm" }}
            >
              {TemplateComponent && (
                <TemplateComponent data={data} customization={customization} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
