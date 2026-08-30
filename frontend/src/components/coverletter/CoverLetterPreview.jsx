import React, { useRef, useEffect, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  Check,
  Copy,
  Type,
  Palette
} from 'lucide-react';
import { generateCoverLetterPDF } from '../../utils/pdfGenerator';
import { FONT_OPTIONS } from '../builder/TemplateCustomizer';

const SIZES = [
  { id: "small", label: "Compact" },
  { id: "default", label: "Standard" },
  { id: "large", label: "Prominent" }
];

export default function CoverLetterPreview({ formData, customization, setCustomization }) {
  const containerRef = useRef(null);
  const letterRef = useRef(null);
  const [zoomScale, setZoomScale] = useState(0.55);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Auto-fit initial scale on mount & resize
  useEffect(() => {
    const handleAutoFit = () => {
      if (containerRef.current) {
        const availableW = containerRef.current.clientWidth - 48;
        const fitZoom = Math.min(Math.max(availableW / 794, 0.35), 0.85);
        setZoomScale(parseFloat(fitZoom.toFixed(2)));
      }
    };
    handleAutoFit();
    window.addEventListener('resize', handleAutoFit);
    return () => window.removeEventListener('resize', handleAutoFit);
  }, []);

  const handleCustomizationChange = (e) => {
    const { name, value } = e.target;
    setCustomization(prev => ({ ...prev, [name]: value }));
  };

  const handleExportPDF = async () => {
    try {
      setDownloading(true);
      const pdfBytes = await generateCoverLetterPDF(formData, customization);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(formData.name || 'Candidate').replace(/\s+/g, '_')}_Cover_Letter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Font size scale multiplier
  const sizeScale = customization.fontSize === 'small' ? 0.88 : customization.fontSize === 'large' ? 1.25 : 1.05;

  const getTemplateStyles = () => {
    switch(customization.templateId) {
      case 'modern':
        return {
          container: "flex bg-white min-h-[1123px]",
          sidebar: `w-[260px] p-8 text-white flex-shrink-0`,
          main: "flex-1 p-10",
          header: "border-b-2 pb-4 mb-6",
        };
      case 'minimal':
        return {
          container: "bg-white p-14 text-left min-h-[1123px]",
          sidebar: "hidden",
          main: "w-full",
          header: "mb-8",
        };
      case 'executive':
        return {
          container: "bg-white min-h-[1123px]",
          sidebar: "hidden",
          main: "w-full",
          header: "text-center text-white py-10 px-14",
          headerBg: true,
        };
      case 'professional':
        return {
          container: "bg-white p-14 min-h-[1123px]",
          sidebar: "hidden",
          main: "w-full",
          header: "pb-5 mb-8 flex justify-between items-start flex-wrap",
          headerBorder: true,
        };
      case 'classic':
      default:
        return {
          container: "bg-white p-14 min-h-[1123px]",
          sidebar: "hidden",
          main: "w-full",
          header: "border-b-2 pb-5 mb-8 text-center",
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className="h-full w-full flex flex-col relative overflow-hidden">
      {/* ── Sub-toolbar for Typography & Accent ── */}
      <div className="h-11 px-4 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-10 text-xs">
        <div className="flex items-center gap-3">
          {/* Font Selector */}
          <div className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              name="fontFamily"
              value={customization.fontFamily}
              onChange={handleCustomizationChange}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
            >
              {FONT_OPTIONS.map(f => (
                <option key={f.id} value={f.family}>{f.label} ({f.category})</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            {SIZES.map(s => (
              <button
                key={s.id}
                onClick={() => setCustomization(prev => ({ ...prev, fontSize: s.id }))}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                  customization.fontSize === s.id
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Accent Color */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="color"
              name="accentColor"
              value={customization.accentColor}
              onChange={handleCustomizationChange}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              title="Custom Accent Color"
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable A4 Canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-8 flex justify-center items-start custom-scrollbar relative z-10"
      >
        <div 
          ref={letterRef}
          id="cover-letter-printable-area"
          className="bg-white transition-all duration-200 origin-top shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-black/5 dark:ring-white/10 rounded-sm"
          style={{ 
            width: '794px', 
            minHeight: '1123px', 
            transform: `scale(${zoomScale})`, 
            marginBottom: `${-(1 - zoomScale) * 1123 + 40}px`,
            fontFamily: customization.fontFamily,
          }}
        >
          <div className={`${styles.container} w-full text-slate-800`}>
            
            {/* Sidebar (Modern Template Only) */}
            {customization.templateId === 'modern' && (
              <div className={styles.sidebar} style={{ backgroundColor: customization.accentColor }}>
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {formData.name ? formData.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'C'}
                </div>
                <h1 className="text-xl font-bold leading-tight mb-2 text-center">{formData.name || 'Your Name'}</h1>
                <div className="w-8 h-1 bg-white/40 mb-6 mx-auto"></div>
                <div className="space-y-3 text-xs text-white/90">
                  {formData.email && <p className="break-all">{formData.email}</p>}
                  {formData.phone && <p>{formData.phone}</p>}
                </div>
              </div>
            )}

            {/* Executive Header (Dark Banner) */}
            {customization.templateId === 'executive' && (
              <div className={styles.header} style={{ backgroundColor: customization.accentColor }}>
                <h1 className="text-3xl font-black mb-2 uppercase tracking-wider">{formData.name || 'Your Name'}</h1>
                <p className="text-white/80 text-xs font-semibold tracking-wide">
                  {[formData.email, formData.phone].filter(Boolean).join('   |   ')}
                </p>
              </div>
            )}

            {/* Main Content Area */}
            <div className={styles.main} style={customization.templateId === 'executive' ? { padding: '32px 56px' } : {}}>
              
              {/* Header (Classic, Minimal, Professional) */}
              {!['modern', 'executive'].includes(customization.templateId) && (
                <div 
                  className={styles.header} 
                  style={
                    customization.templateId === 'classic' ? { borderBottomColor: customization.accentColor } : 
                    customization.templateId === 'professional' ? { borderBottom: `2px solid ${customization.accentColor}` } : 
                    {}
                  }
                >
                  {customization.templateId === 'professional' ? (
                    <>
                      <div>
                        <h1 className="text-3xl font-black mb-1" style={{ color: '#0f172a' }}>
                          {formData.name || 'Your Name'}
                        </h1>
                      </div>
                      <div className="text-right text-xs text-slate-500 font-medium leading-relaxed">
                        {formData.email && <p>{formData.email}</p>}
                        {formData.phone && <p>{formData.phone}</p>}
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="text-3xl font-black mb-2" style={{ color: customization.templateId === 'minimal' ? customization.accentColor : '#0f172a' }}>
                        {formData.name || 'Your Name'}
                      </h1>
                      <p className="text-slate-500 text-xs font-semibold tracking-wide">
                        {[formData.email, formData.phone].filter(Boolean).join('   |   ')}
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Letter Body */}
              <div 
                className="mt-6 space-y-5 text-slate-700"
                style={{ fontSize: `${14 * sizeScale}px`, lineHeight: 1.6 }}
              >
                {formData.date && (
                  <p className="font-bold text-slate-900">
                    {new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </p>
                )}
                
                <div className="font-medium text-slate-800 space-y-0.5">
                  {formData.hiringManager && <p className="font-bold">{formData.hiringManager}</p>}
                  {formData.targetRole && <p className="font-semibold text-slate-900">{formData.targetRole}</p>}
                  {formData.targetCompany && <p className="font-semibold">{formData.targetCompany}</p>}
                  {formData.companyAddress && <p className="text-slate-500 text-xs">{formData.companyAddress}</p>}
                </div>

                <div className={`pt-2 whitespace-pre-wrap ${
                  formData.letterAlignment === 'justify' ? 'text-justify' :
                  formData.letterAlignment === 'center' ? 'text-center' : 'text-left'
                }`}>
                  {formData.letterContent || 'Your tailored cover letter will appear here when generated...'}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Studio Zoom Controls ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-lg text-xs">
        <button
          onClick={() => setZoomScale((z) => Math.max(0.3, parseFloat((z - 0.05).toFixed(2))))}
          title="Zoom Out"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span className="font-mono text-[11px] font-bold min-w-[36px] text-center text-slate-800 dark:text-slate-200">
          {Math.round(zoomScale * 100)}%
        </span>

        <button
          onClick={() => setZoomScale((z) => Math.min(1.2, parseFloat((z + 0.05).toFixed(2))))}
          title="Zoom In"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

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
          <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Cover Letter Preview</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? "Generating..." : "Download PDF"}</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-8 flex justify-center items-start custom-scrollbar">
            <div className="bg-white shadow-2xl rounded-sm my-auto" style={{ width: '794px', minHeight: '1123px', fontFamily: customization.fontFamily }}>
              <div className={`${styles.container} w-full text-slate-800`}>
                {/* Modern Sidebar */}
                {customization.templateId === 'modern' && (
                  <div className={styles.sidebar} style={{ backgroundColor: customization.accentColor }}>
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'C'}
                    </div>
                    <h1 className="text-xl font-bold leading-tight mb-2 text-center">{formData.name || 'Your Name'}</h1>
                    <div className="w-8 h-1 bg-white/40 mb-6 mx-auto"></div>
                    <div className="space-y-3 text-xs text-white/90">
                      {formData.email && <p className="break-all">{formData.email}</p>}
                      {formData.phone && <p>{formData.phone}</p>}
                    </div>
                  </div>
                )}

                {/* Main */}
                <div className={styles.main}>
                  <div className="space-y-5 text-slate-700" style={{ fontSize: `${14 * sizeScale}px`, lineHeight: 1.6 }}>
                    {formData.date && <p className="font-bold text-slate-900">{formData.date}</p>}
                    <div className="pt-2 whitespace-pre-wrap">
                      {formData.letterContent || 'Your cover letter will appear here...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
