import React, { useRef, useEffect, useState } from 'react';
import { Download, FileText, Settings2, ZoomIn, ZoomOut, Maximize2, Copy, Check, Printer } from 'lucide-react';
import { generateCoverLetterPDF } from '../../utils/pdfGenerator';

const TEMPLATES = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'executive', label: 'Executive' },
  { id: 'professional', label: 'Professional' }
];

const FONTS = [
  { id: "'Inter', sans-serif", label: "Inter (Clean)" },
  { id: "'Outfit', sans-serif", label: "Outfit (Modern)" },
  { id: "'Plus Jakarta Sans', sans-serif", label: "Jakarta (Geometric)" },
  { id: "'Merriweather', serif", label: "Merriweather (Serif)" },
  { id: "'Roboto Mono', monospace", label: "Mono (Technical)" }
];

const SIZES = [
  { id: "small", label: "Small" },
  { id: "default", label: "Default" },
  { id: "large", label: "Large" }
];

export default function CoverLetterPreview({ formData, customization, setCustomization }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.48);
  const containerRef = useRef(null);
  const letterRef = useRef(null);

  // Auto-fit initial scale on load
  useEffect(() => {
    const handleAutoFit = () => {
      if (containerRef.current) {
        const availableW = containerRef.current.clientWidth - 48;
        const fitZoom = Math.min(Math.max(availableW / 794, 0.35), 0.95);
        setZoomScale(fitZoom);
      }
    };
    handleAutoFit();
  }, []);

  const handleCustomizationChange = (e) => {
    const { name, value } = e.target;
    setCustomization(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      setDownloading(true);
      const pdfBytes = await generateCoverLetterPDF(formData, customization);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.name || 'Candidate'}_Cover_Letter.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.letterContent || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#070b14] overflow-hidden">
      {/* Customization Toolbar */}
      <div className="bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800 p-3.5 shrink-0 shadow-sm z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Settings2 className="w-4 h-4 text-slate-400" />
          
          <select 
            name="templateId" 
            value={customization.templateId} 
            onChange={handleCustomizationChange}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label} Layout</option>)}
          </select>

          <select 
            name="fontFamily" 
            value={customization.fontFamily} 
            onChange={handleCustomizationChange}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer max-w-[140px]"
          >
            {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>

          <select 
            name="fontSize" 
            value={customization.fontSize} 
            onChange={handleCustomizationChange}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {SIZES.map(s => <option key={s.id} value={s.id}>{s.label} Size</option>)}
          </select>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accent</span>
            <input 
              type="color" 
              name="accentColor" 
              value={customization.accentColor} 
              onChange={handleCustomizationChange}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Toolbar */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.3, Number((z - 0.08).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-bold font-mono px-1.5 min-w-[38px] text-center text-slate-700 dark:text-slate-200">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((z) => Math.min(1.2, Number((z + 0.08).toFixed(2))))}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(0.48)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-600 transition-all"
              title="Fit to screen"
            >
              Fit
            </button>
          </div>

          <button 
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button 
            onClick={handleExportPDF}
            disabled={downloading}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {downloading ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* A4 Scaled Preview Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 flex justify-center items-start custom-scrollbar">
        <div 
          ref={letterRef}
          id="cover-letter-printable-area"
          className="shadow-2xl ring-1 ring-black/10 bg-white transition-all transform origin-top"
          style={{ 
            width: '794px', 
            minHeight: '1123px', 
            transform: `scale(${zoomScale})`, 
            marginBottom: `${-(1 - zoomScale) * 1123}px`,
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
    </div>
  );
}

