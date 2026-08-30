import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  Palette,
  RotateCcw,
  CheckCircle2,
  Download,
  Target,
  FileText,
  Loader2,
  Sparkles,
  ChevronDown,
  FileCheck,
} from "lucide-react";

import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import TEMPLATES from "./templates";
import { generateResumePDF } from "../../utils/pdfGenerator";

/* ── LocalStorage Keys ── */
const STORAGE_KEY = "astra-resume-data";
const CUSTOM_KEY = "astra-resume-customization";

/* ── Default Empty Resume ── */
const DEFAULT_DATA = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
};

const DEFAULT_CUSTOMIZATION = {
  templateId: "classic",
  accentColor: "#4f46e5",
  fontFamily: "'Inter', sans-serif",
  fontSize: "default",
};

/* ── Main Resume Studio Orchestrator ── */
const ResumeBuilder = ({ theme, onAnalyzeResume }) => {
  /* ── State ── */
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });

  const [customization, setCustomization] = useState(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOMIZATION;
    } catch {
      return DEFAULT_CUSTOMIZATION;
    }
  });

  const [activeTab, setActiveTab] = useState("personal");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadedPdf, setDownloadedPdf] = useState(false);
  const [downloadedTxt, setDownloadedTxt] = useState(false);

  /* ── Auto-save to localStorage ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(customization));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1800);
      } catch (err) {
        console.warn("Could not save to localStorage:", err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [resumeData, customization]);

  /* ── Template selection ── */
  const selectedTemplate = TEMPLATES.find((t) => t.id === customization.templateId) || TEMPLATES[0];

  /* ── Handlers ── */
  const handleDataChange = useCallback((newData) => {
    setResumeData(newData);
    setSaveStatus("saving");
  }, []);

  const handleCustomizationChange = useCallback((newCustom) => {
    setCustomization(newCustom);
    setSaveStatus("saving");
  }, []);

  const handleTemplateSelect = (templateId) => {
    handleCustomizationChange({ ...customization, templateId });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all resume data? This will reset all fields.")) {
      setResumeData(DEFAULT_DATA);
      setCustomization(DEFAULT_CUSTOMIZATION);
      setActiveTab("personal");
    }
  };

  /* ── Plain text generation for ATS Export and Analysis ── */
  const generatePlainText = () => {
    const lines = [];
    const pi = resumeData?.personalInfo || {};
    if (pi.fullName) lines.push(pi.fullName.toUpperCase());
    
    const contactBits = [pi.email, pi.phone, pi.location].filter(Boolean);
    if (contactBits.length) lines.push(contactBits.join(" | "));
    
    const linkBits = [pi.linkedin, pi.portfolio].filter(Boolean);
    if (linkBits.length) lines.push(linkBits.join(" | "));

    if (resumeData?.summary?.trim()) {
      lines.push("", "PROFESSIONAL SUMMARY", resumeData.summary.trim());
    }

    const normalizedSkills = Array.isArray(resumeData?.skills)
      ? resumeData.skills.filter((s) => typeof s === "string" && s.trim())
      : typeof resumeData?.skills === "string"
        ? resumeData.skills.split(/[,;\n•·|]+/).map((s) => s.trim()).filter(Boolean)
        : [];

    if (normalizedSkills.length) {
      lines.push("", "TECHNICAL SKILLS", normalizedSkills.join(", "));
    }

    if (resumeData?.experience?.length) {
      lines.push("", "WORK EXPERIENCE");
      resumeData.experience.forEach((exp) => {
        if (!exp.title && !exp.company) return;
        const titleLine = [exp.title, exp.company].filter(Boolean).join(" - ");
        const dateLine = [exp.startDate, exp.endDate].filter(Boolean).join(" to ");
        lines.push(`${titleLine}${dateLine ? ` (${dateLine})` : ""}${exp.location ? ` | ${exp.location}` : ""}`);
        (exp.bullets || []).forEach((b) => {
          if (b && typeof b === "string" && b.trim()) {
            lines.push(`• ${b.trim()}`);
          }
        });
        lines.push("");
      });
    }

    if (resumeData?.education?.length) {
      lines.push("EDUCATION");
      resumeData.education.forEach((edu) => {
        if (!edu.degree && !edu.institution) return;
        lines.push(`${edu.degree || ""}${edu.institution ? ` - ${edu.institution}` : ""}${edu.year ? ` (${edu.year})` : ""}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}`);
      });
    }

    if (resumeData?.projects?.length) {
      lines.push("", "PROJECTS");
      resumeData.projects.forEach((proj) => {
        if (!proj.name) return;
        lines.push(`${proj.name}${proj.techStack ? ` (${proj.techStack})` : ""}`);
        if (proj.description) lines.push(proj.description.trim());
        if (proj.link) lines.push(proj.link.trim());
        lines.push("");
      });
    }

    if (resumeData?.certifications?.length) {
      lines.push("CERTIFICATIONS");
      resumeData.certifications.forEach((cert) => {
        if (!cert.name) return;
        lines.push(`${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}${cert.year ? ` (${cert.year})` : ""}`);
      });
    }

    if (resumeData?.languages?.length) {
      lines.push("", "LANGUAGES");
      lines.push(
        resumeData.languages
          .filter((l) => l.language)
          .map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`)
          .join(", ")
      );
    }

    return lines.join("\n").trim();
  };

  const handleExportPDF = async () => {
    setDownloadingPdf(true);
    try {
      const pdfBytes = await generateResumePDF(resumeData, customization);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resumeData?.personalInfo?.fullName || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadedPdf(true);
      setTimeout(() => setDownloadedPdf(false), 2500);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert(`Failed to generate PDF: ${err.message || err}. Please check console.`);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadTxt = () => {
    const text = generatePlainText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(resumeData?.personalInfo?.fullName || "Resume").replace(/\s+/g, "_")}_ATS.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedTxt(true);
    setTimeout(() => setDownloadedTxt(false), 2000);
  };

  const handleAnalyze = () => {
    const text = generatePlainText();
    if (onAnalyzeResume && text.trim()) {
      onAnalyzeResume(text);
    }
  };

  const candidateName = resumeData?.personalInfo?.fullName?.trim() || "Untitled Resume";

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#070b14] overflow-hidden">
      {/* ── Top Studio Toolbar ── */}
      <header className="h-14 px-4 sm:px-6 bg-white dark:bg-[#0b0f19] border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 shrink-0 z-20 shadow-2xs">
        {/* Left: Document Info & Auto-save status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {candidateName}
              </h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                {saveStatus === "saving" ? (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-saved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Template & Design Quick Switcher */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {TEMPLATES.map((tmpl) => {
            const isSelected = customization.templateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tmpl.name}
              </button>
            );
          })}

          <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Jump to Design Tab */}
          <button
            onClick={() => setActiveTab("design")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "design"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Design</span>
          </button>
        </div>

        {/* Right: Studio Actions */}
        <div className="flex items-center gap-2">
          {/* Analyze ATS */}
          <button
            onClick={handleAnalyze}
            title="Evaluate this resume against live ATS benchmarks"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold transition-all shadow-2xs"
          >
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Score with ATS</span>
          </button>

          {/* ATS .TXT */}
          <button
            onClick={handleDownloadTxt}
            title="Download plain text format for online forms"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all"
          >
            {downloadedTxt ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <FileText className="w-3.5 h-3.5" />}
            <span>.TXT</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={downloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
          >
            {downloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : downloadedPdf ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{downloadingPdf ? "Exporting..." : downloadedPdf ? "Downloaded" : "Export PDF"}</span>
          </button>

          {/* Reset Action */}
          <button
            onClick={handleReset}
            title="Reset all resume fields"
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── Main Studio Split Workspace ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Studio Pane: Form Editor */}
        <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800/80 flex flex-col min-h-0 p-4 sm:p-5 overflow-hidden">
          <ResumeForm
            data={resumeData}
            onChange={handleDataChange}
            customization={customization}
            onCustomizationChange={handleCustomizationChange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Right Studio Pane: Live Interactive Canvas */}
        <div className="lg:col-span-6 xl:col-span-7 bg-slate-100/70 dark:bg-[#070b14] flex flex-col min-h-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <ResumePreview
            data={resumeData}
            customization={customization}
            TemplateComponent={selectedTemplate.component}
            onAnalyze={handleAnalyze}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
