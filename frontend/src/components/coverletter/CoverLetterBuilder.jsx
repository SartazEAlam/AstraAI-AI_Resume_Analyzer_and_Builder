import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  Settings2,
  MailCheck
} from 'lucide-react';
import CoverLetterForm from './CoverLetterForm';
import CoverLetterPreview from './CoverLetterPreview';
import { generateCoverLetterPDF } from '../../utils/pdfGenerator';

const TEMPLATES = [
  { id: 'classic', label: 'Classic' },
  { id: 'modern', label: 'Modern' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'executive', label: 'Executive' },
  { id: 'professional', label: 'Professional' }
];

export default function CoverLetterBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    targetRole: '',
    targetCompany: '',
    companyAddress: '',
    hiringManager: '',
    tone: 'Professional',
    letterAlignment: 'left',
    letterContent: '',
    skills: [],
    experienceHighlights: []
  });

  const [customization, setCustomization] = useState({
    templateId: 'classic',
    fontFamily: "'Inter', sans-serif",
    fontSize: 'default',
    accentColor: '#4f46e5'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing user data from localStorage on mount
  useEffect(() => {
    try {
      const savedResume = localStorage.getItem('astra-resume-data');
      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        setFormData(prev => ({
          ...prev,
          name: parsed.personalInfo?.fullName || '',
          email: parsed.personalInfo?.email || '',
          phone: parsed.personalInfo?.phone || '',
          skills: parsed.skills || [],
          experienceHighlights: parsed.experience?.map(e => e.title ? `${e.title} at ${e.company}` : '').filter(Boolean) || []
        }));
      }
    } catch (e) {
      console.error("Error loading resume data for cover letter", e);
    }
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/generate-cover-letter`, {
        name: formData.name,
        target_role: formData.targetRole,
        target_company: formData.targetCompany,
        hiring_manager: formData.hiringManager,
        tone: formData.tone,
        skills: formData.skills,
        experience_highlights: formData.experienceHighlights
      });

      if (response.data && response.data.letter) {
        setFormData(prev => ({
          ...prev,
          letterContent: response.data.letter
        }));
      }
    } catch (error) {
      console.error("Error generating cover letter", error);
      alert("Failed to generate cover letter. Please verify the backend is running.");
    } finally {
      setIsGenerating(false);
    }
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

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.letterContent || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const documentTitle = formData.name ? `${formData.name}'s Cover Letter` : "Untitled Cover Letter";

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#070b14] overflow-hidden">
      {/* ── Top Studio Toolbar ── */}
      <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left: Document Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <MailCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              {documentTitle}
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Studio
            </div>
          </div>
        </div>

        {/* Center: Template Selector */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {TEMPLATES.map((tmpl) => {
            const isSelected = customization.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => setCustomization(prev => ({ ...prev, templateId: tmpl.id }))}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tmpl.label}
              </button>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* AI Tailor Action */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 text-xs font-bold transition-all shadow-2xs disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            <span>{isGenerating ? "Writing..." : "AI Generate"}</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopy}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleExportPDF}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : downloaded ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloading ? "Exporting..." : downloaded ? "Downloaded" : "Export PDF"}</span>
          </button>
        </div>
      </header>

      {/* ── Studio Split Workspace ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left: Form */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 flex flex-col min-h-0 overflow-hidden">
          <CoverLetterForm 
            formData={formData} 
            setFormData={setFormData}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            customization={customization}
            setCustomization={setCustomization}
          />
        </div>

        {/* Right: Canvas Preview */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-100/70 dark:bg-[#070b14] flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <CoverLetterPreview 
            formData={formData} 
            customization={customization} 
            setCustomization={setCustomization} 
          />
        </div>
      </div>
    </div>
  );
}
