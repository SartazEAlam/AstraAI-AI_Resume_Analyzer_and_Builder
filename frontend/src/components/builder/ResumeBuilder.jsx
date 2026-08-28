import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LayoutTemplate,
  Settings2,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

import ResumeForm from "./ResumeForm";
import ResumePreview from "./ResumePreview";
import TemplateCustomizer from "./TemplateCustomizer";
import TEMPLATES from "./templates";

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
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  fontSize: "default",
};

/* ── Main Resume Builder Orchestrator ── */
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

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved

  /* ── Auto-save to localStorage ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(customization));
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1500);
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
    if (window.confirm("Are you sure you want to clear all resume data? This cannot be undone.")) {
      setResumeData(DEFAULT_DATA);
      setCustomization(DEFAULT_CUSTOMIZATION);
    }
  };

  const handleAnalyze = (text) => {
    if (onAnalyzeResume) {
      onAnalyzeResume(text);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800 text-xs font-bold text-purple-900 dark:text-purple-200 tracking-wide mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Resume Builder · 6 Premium Templates
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Build Your <span className="text-indigo-600 dark:text-indigo-400">Perfect Resume</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto">
          Fill in your details, pick a template, customize colors & fonts, and download a stunning ATS-optimized resume in minutes.
        </p>
      </motion.div>

      {/* ── Template Selector Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 overflow-x-auto pb-2 builder-form-scrollbar">
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleTemplateSelect(tmpl.id)}
              className={`flex-shrink-0 group relative rounded-2xl border-2 transition-all p-3 min-w-[160px] text-left ${
                customization.templateId === tmpl.id
                  ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md"
              }`}
            >
              {customization.templateId === tmpl.id && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <LayoutTemplate className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">{tmpl.name}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                {tmpl.description}
              </p>
              <div className="flex gap-1.5 mt-2">
                {tmpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Main Split Layout ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Left: Form Editor */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  showCustomizer
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400"
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Customize Style
              </button>
            </div>
            <div className="flex items-center gap-2">
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>

          {/* Customizer Panel (collapsible) */}
          {showCustomizer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <TemplateCustomizer
                customization={customization}
                onChange={handleCustomizationChange}
              />
            </motion.div>
          )}

          {/* Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-[calc(100vh-180px)]">
            <ResumeForm data={resumeData} onChange={handleDataChange} />
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-5 sticky top-24 h-[calc(100vh-180px)]">
          <ResumePreview
            data={resumeData}
            customization={customization}
            TemplateComponent={selectedTemplate.component}
            onAnalyze={handleAnalyze}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeBuilder;
