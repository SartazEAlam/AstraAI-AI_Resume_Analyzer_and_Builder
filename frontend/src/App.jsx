import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Target,
  TrendingUp,
  Zap,
  LayoutDashboard,
  BrainCircuit,
  ArrowRight,
  Briefcase,
  Calendar,
  Download,
  Layers,
  ShieldCheck,
  Compass,
  Sun,
  Moon,
  ExternalLink,
  ChevronDown,
  Globe,
} from "lucide-react";

/* ── Modular Component Imports ── */
import Navbar from "./components/shared/Navbar";
import { ScoreRing, DualScoreRing } from "./components/shared/ScoreRing";
import FeatureCard from "./components/shared/FeatureCard";
import LoadingOverlay from "./components/shared/LoadingOverlay";
import LiveEditor from "./components/editor/LiveEditor";
import ExecutiveReport from "./components/report/ExecutiveReport";
import OrganizationDashboard from "./components/dashboard/OrganizationDashboard";
import ResumeBuilder from "./components/builder/ResumeBuilder";
import CoverLetterBuilder from "./components/coverletter/CoverLetterBuilder";
/* ── File Validation ── */
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt", ".rtf", ".md"];
const isAllowedFile = (name) => {
  const lower = (name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

/* ── Main Application ── */

function App() {
  const [mode, setMode] = useState("individual");
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" or "report"
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customJD, setCustomJD] = useState("");

  // Theme Management (light / dark) with LocalStorage persistence
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("astra-theme");
    if (saved === "light" || saved === "dark") return saved;
    return "light"; // Default to clean light mode unless toggled
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      document.body.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      document.body.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("astra-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const filteredJobs = selectedCategory
    ? jobs.filter((j) => (j.category || "Other") === selectedCategory)
    : jobs;

  const currentJobObj = jobs.find((j) => String(j.id) === String(selectedJobId));
  const currentJobTitle = currentJobObj ? currentJobObj.title : "";
  const currentCategory = selectedCategory || (currentJobObj ? currentJobObj.category : "");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/jobs")
      .then((res) => setJobs(res.data))
      .catch(console.error);
  }, []);

  // Single upload state
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setError("");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isAllowedFile(dropped.name)) {
      setFile(dropped);
      setFileName(dropped.name);
      setError("");
    } else {
      setError("Please upload a supported resume format (PDF, Word DOCX/DOC, TXT, RTF).");
    }
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume file to analyze.");
      return;
    }

    setLoading(true);
    setResults(null);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    if (selectedJobId === "custom") {
      formData.append("customJD", customJD);
    } else if (selectedJobId) {
      formData.append("jobId", selectedJobId);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload",
        formData
      );
      setTimeout(() => {
        setResults(response.data);
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      const errorMessage = err.response?.data?.error || "Service connection failed. Ensure backend and ML services are running.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleReAnalyze = async (newText) => {
    if (!newText.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/analyze-text", {
        text: newText,
        jobId: selectedJobId === "custom" ? null : selectedJobId,
        customJD: selectedJobId === "custom" ? customJD : null,
      });

      setResults(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Re-analyze error:", err);
      setError("Failed to re-analyze text.");
      setLoading(false);
    }
  };

  const handleQuickAnalyze = async (roleTitle) => {
    if (!results?.parsed_text) return;
    
    // Market Role Alignment buttons should ALWAYS map to the global industry dictionary, 
    // never to a specific, idiosyncratic DB job.
    let targetJobId = "custom";
    let targetCustomJD = roleTitle;
    
    setSelectedJobId("custom");
    setCustomJD(targetCustomJD);

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/analyze-text", {
        text: results.parsed_text,
        jobId: targetJobId === "custom" ? null : targetJobId,
        customJD: targetJobId === "custom" ? targetCustomJD : null,
      });

      setResults(response.data);
      setViewMode("dashboard");
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Quick analyze error:", err);
      setError(`Failed to re-analyze for role: ${roleTitle}`);
      setLoading(false);
    }
  };

  const handleQuickAnalyzeFromDropdown = async (jobIdVal) => {
    if (!results?.parsed_text) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/analyze-text", {
        text: results.parsed_text,
        jobId: jobIdVal === "" ? null : jobIdVal,
        customJD: null,
      });

      setResults(response.data);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError("Failed to re-analyze for selected role.");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${theme === "dark" ? "bg-[#0b0f19] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Navbar mode={mode} setMode={setMode} theme={theme} toggleTheme={toggleTheme} />

      <main className={
        mode === "builder" || mode === "cover_letter"
          ? "relative z-10 pt-[57px] h-screen w-full overflow-hidden flex flex-col"
          : "relative z-10 pt-28 pb-20 px-6 max-w-7xl mx-auto"
      }>
        {mode === "individual" ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 tracking-wide mb-4 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  ATS Parsing Engine Active · 54 Industry Models
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
                  Precision Resume & <span className="text-indigo-600 dark:text-indigo-400">ATS Audit</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
                  Audit keyword density, verify experience timelines, and benchmark role readiness with parser-level accuracy.
                </p>
              </motion.div>
            </div>

            {/* Upload & Dashboard Section */}
            <div className="max-w-4xl mx-auto">
              {!results && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  {/* Upload Card */}
                  <div className="solid-card bg-white dark:bg-slate-900 p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div
                      className={`upload-zone min-h-[260px] flex flex-col items-center justify-center p-8 cursor-pointer bg-slate-50 dark:bg-[#070b14] border-2 border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl hover:border-indigo-500 hover:dark:border-indigo-400 hover:bg-indigo-50/30 hover:dark:bg-indigo-950/30 transition-all ${dragOver ? "drag-over border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/50" : ""}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.doc,.txt,.rtf,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf"
                      />

                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 flex items-center justify-center mb-5 text-indigo-600 dark:text-indigo-400">
                        <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>

                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {fileName ? fileName : "Upload Candidate Document"}
                        </h3>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {fileName
                            ? "File selected — ready for audit"
                            : "Drag and drop your resume file here, or click to browse"}
                        </p>
                        <div className="flex items-center justify-center gap-2 pt-3">
                          {["PDF", "DOCX", "DOC", "TXT", "RTF"].map((ext) => (
                            <span
                              key={ext}
                              className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs"
                            >
                              .{ext}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5"
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                        {error}
                      </motion.div>
                    )}

                    {/* 2-Dropdown Cascading Job Selector */}
                    <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dropdown 1: Industry / Sector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            1. Industry Sector
                          </label>
                          <div className="relative">
                            <select
                              value={selectedCategory}
                              onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setSelectedJobId(""); // Reset specific role on category switch
                              }}
                              className="appearance-none w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                            >
                              <option value="">
                                All Sectors (Cross-Industry Evaluation)
                              </option>
                              {[
                                ...new Set(
                                  jobs.map((j) => j.category || "Other"),
                                ),
                              ].map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Dropdown 2: Specific Job Role */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            2. Target Job Role (Optional)
                          </label>
                          <div className="relative">
                            <select
                              value={selectedJobId}
                              onChange={(e) =>
                                setSelectedJobId(String(e.target.value))
                              }
                              className="appearance-none w-full p-3 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm font-semibold transition-all shadow-sm cursor-pointer"
                            >
                              <option value="">
                                General Analysis (Universal Profile Readiness)
                              </option>
                              <option value="custom">
                                ✨ Custom Job Description (Paste Text)
                              </option>
                              {filteredJobs.map((job) => (
                                <option key={job.id} value={String(job.id)}>
                                  {job.title}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Custom JD Textarea */}
                      <AnimatePresence>
                        {selectedJobId === "custom" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2">
                              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                Paste Job Description
                              </label>
                              <textarea
                                value={customJD}
                                onChange={(e) => setCustomJD(e.target.value)}
                                placeholder="Paste the full job description here. Our AI will automatically extract required skills and compare them against the candidate's resume..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100 text-sm font-medium transition-all shadow-inner resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={!file}
                      className="w-full mt-6 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group"
                    >
                      <span>Run ATS Evaluation & Audit</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Features Grid */}
                  <div
                    id="how-it-works"
                    className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6"
                  >
                    <FeatureCard
                      icon={Target}
                      title="Keyword Taxonomy"
                      desc="Direct technical and domain skill extraction from verified industry gazetteers."
                    />
                    <FeatureCard
                      icon={TrendingUp}
                      title="Multi-Sector Alignment"
                      desc="TF-IDF cosine similarity benchmarking across 54+ live market roles."
                    />
                    <FeatureCard
                      icon={ShieldCheck}
                      title="Omission Detection"
                      desc="Pinpoint missing required qualifications before submitting to recruiter ATS."
                    />
                  </div>
                </motion.div>
              )}

              {/* Loading View */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LoadingOverlay />
                </motion.div>
              )}

              {/* Results Dashboard */}
              <AnimatePresence>
                {results && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* View Switcher & Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 no-print bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setViewMode("dashboard")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                            viewMode === "dashboard"
                              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Interactive Dashboard
                        </button>
                        <button
                          onClick={() => setViewMode("report")}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                            viewMode === "report"
                              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Executive ATS Report
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative group hidden sm:block">
                          <select 
                            value={selectedJobId || "general"}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "general") {
                                setSelectedJobId("");
                                handleQuickAnalyzeFromDropdown("");
                              } else if (val !== "custom") {
                                setSelectedJobId(val);
                                handleQuickAnalyzeFromDropdown(val);
                              }
                            }}
                            className="appearance-none pr-8 pl-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors outline-none cursor-pointer border border-slate-200 dark:border-slate-700"
                          >
                            <option value="general">Global Market Profile</option>
                            <optgroup label="Your ATS Jobs">
                              {jobs.map(j => (
                                <option key={j.id} value={String(j.id)}>{j.title}</option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                             <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                        </div>

                        <button
                          onClick={() => window.print()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md shadow-indigo-500/20"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Print
                        </button>
                        <button
                          onClick={() => {
                            setResults(null);
                            setFile(null);
                            setFileName("");
                            setViewMode("dashboard");
                          }}
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          Analyze New →
                        </button>
                      </div>
                    </div>

                    {viewMode === "report" ? (
                      <ExecutiveReport
                        results={results}
                        fileName={fileName}
                        jobTitle={currentJobTitle}
                        category={currentCategory}
                      />
                    ) : (
                      <>
                        <div className="screen-only space-y-8">
                          {/* Score Overview */}
                          <div className="solid-card bg-white dark:bg-slate-900 p-8 md:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-2 mb-8">
                              <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                  Audit & Assessment Scorecard
                                </h2>
                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3">
                                  {results.is_market_role ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-xs font-bold border border-sky-200 dark:border-sky-800/60 shadow-sm">
                                      <Globe className="w-3.5 h-3.5" />
                                      Global Industry Benchmark
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60 shadow-sm">
                                      <Target className="w-3.5 h-3.5" />
                                      Custom Target Job
                                    </span>
                                  )}
                                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    {results.is_market_role
                                      ? "Evaluated against standardized, cross-company market requirements."
                                      : "Evaluated precisely against the required skills from your job description."}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                                PROFILE AUDIT
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-2">
                              {results.required_skill_count > 0 ? (
                                <ScoreRing
                                  score={results.match_percentage}
                                  label="Target Job Match"
                                  badge={results.is_market_role ? "🌎 Global Industry Benchmark" : "🎯 Specific Target Job"}
                                  icon={results.is_market_role ? Globe : Target}
                                  colorClass={results.is_market_role ? "stroke-sky-500 dark:stroke-sky-400" : "stroke-indigo-500 dark:stroke-indigo-400"}
                                />
                              ) : (
                                <DualScoreRing
                                  topScore={
                                    results.top_role_match || results.match_percentage
                                  }
                                  topRole={results.best_role}
                                  globalScore={results.global_market_match}
                                />
                              )}

                              <ScoreRing
                                score={results.strength_score}
                                label="Resume Strength"
                                icon={Zap}
                                colorClass="stroke-purple-500 dark:stroke-purple-400"
                              />
                              <ScoreRing
                                score={
                                  results.required_skill_count > 0
                                    ? Math.round(
                                        (results.matched_skill_count /
                                          results.required_skill_count) *
                                          100,
                                      )
                                    : Math.round(
                                        Math.min(
                                          100,
                                          ((results.extracted_skills?.length || 0) /
                                            15) *
                                            100,
                                        ),
                                      )
                                }
                                label={
                                  results.required_skill_count > 0
                                    ? "Target Skill Match"
                                    : "Skill Breadth"
                                }
                                icon={CheckCircle2}
                                colorClass="stroke-cyan-500 dark:stroke-cyan-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills Section */}
                            <div className="solid-card bg-white dark:bg-slate-900 p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col h-full">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    Extracted Competencies
                                  </h3>
                                </div>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {results.extracted_skills?.length || 0} Detected
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 flex-grow items-start content-start">
                                {results.extracted_skills?.map((skill, i) => (
                                  <span
                                    key={i}
                                    className="font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {(!results.extracted_skills ||
                                  results.extracted_skills.length === 0) && (
                                  <p className="text-slate-400 italic text-xs">
                                    No specific competencies detected from resume text.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Skill Gaps Section */}
                            <div className="solid-card bg-white dark:bg-slate-900 p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col h-full">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    Missing Role Keywords
                                  </h3>
                                </div>
                                {results.missing_skills?.length > 0 && (
                                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                    {results.missing_skills.length} Gaps
                                  </span>
                                )}
                              </div>
                              <div className="flex-grow">
                                {results.missing_skills?.length > 0 ? (
                                  <div className="flex flex-wrap gap-2 items-start content-start">
                                    {results.missing_skills.map((skill, i) => (
                                      <span
                                        key={i}
                                        className="font-mono text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : results.required_skill_count > 0 ? (
                                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                                      ✓ Perfect Keyword Match: Candidate profile contains all core skills required for this role.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                    <p className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                                      Universal screening mode active. Select a specific target role above to evaluate exact keyword omissions.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Semantic Matches Section */}
                          {results.semantic_matches?.length > 0 && (
                            <div className="solid-card bg-indigo-50/50 dark:bg-indigo-950/20 p-7 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-5">
                              <div className="flex items-center justify-between border-b border-indigo-200/50 dark:border-indigo-800/50 pb-4">
                                <div className="flex items-center gap-2.5">
                                  <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    AI Semantic Concept Matches
                                  </h3>
                                </div>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  {results.semantic_matches.length} Mapped
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                {results.semantic_matches.map((match, i) => (
                                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 line-through decoration-rose-300/50">
                                        {match.job_skill}
                                      </span>
                                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {match.matched_with}
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2 py-1 rounded">
                                      {Math.round(match.score * 100)}% SIM
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-2">
                                <span className="text-indigo-500 font-bold">*</span>
                                These skills did not match exactly, but our AI semantic engine determined the candidate has equivalent conceptually-related experience.
                              </p>
                            </div>
                          )}

                          {/* Experience Section */}
                          {results.experience && (
                            <div className="solid-card bg-white dark:bg-slate-900 p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                  <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                    Experience & Seniority Verification
                                  </h3>
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                                  TIMELINE AUDIT
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Total Detected Tenure
                                  </p>
                                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                                    {results.experience.total_years != null
                                      ? `${results.experience.total_years} Year${results.experience.total_years !== 1 ? "s" : ""}`
                                      : "Not specified"}
                                  </p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                    Seniority Classification
                                  </p>
                                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    {results.experience.seniority_level || "Professional"}
                                  </p>
                                </div>
                              </div>
                              {results.experience.positions?.length > 0 && (
                                <div className="space-y-2.5 pt-2">
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                    Extracted Positions ({results.experience.positions.length})
                                  </p>
                                  {results.experience.positions.map((pos, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-700 dark:text-slate-300">
                                        <Briefcase className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                          {pos.title}
                                        </p>
                                        {pos.company && (
                                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                                            {pos.company}
                                          </p>
                                        )}
                                        {pos.duration && (
                                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 font-mono">
                                            <Calendar className="w-3 h-3" />{" "}
                                            {pos.duration}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {(!results.experience.positions ||
                                 results.experience.positions.length === 0) &&
                                results.experience.total_years == null && (
                                  <p className="text-slate-400 italic text-xs">
                                    No explicit chronological positions detected in the resume text.
                                  </p>
                                )}
                            </div>
                          )}

                          {/* Role Recommendations */}
                          {results.recommended_roles?.length > 0 && (
                            <div className="solid-card bg-white dark:bg-slate-900 p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2.5">
                                  <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                  <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                                      Market Role Alignment
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      High-confidence career tracks mapped to candidate skill profile
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {results.recommended_roles.map((role, i) => (
                                  <div
                                    key={i}
                                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="text-slate-400 dark:text-slate-500 text-[10px] font-mono font-bold uppercase mb-1">
                                        RANK #{i + 1}
                                      </div>
                                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                                        {role}
                                      </div>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                      <button onClick={() => handleQuickAnalyze(role)} className="flex items-center text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                                        <Target className="w-3.5 h-3.5 mr-1.5" /> Re-Analyze for this Role
                                      </button>
                                      <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Search on LinkedIn
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pristine Executive Report generated for Print / PDF */}
                        <div className="print-only">
                          <ExecutiveReport
                            results={results}
                            fileName={fileName}
                            jobTitle={currentJobTitle}
                            category={currentCategory}
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {results?.parsed_text && (
                <LiveEditor
                  initialText={results.parsed_text}
                  onReAnalyze={handleReAnalyze}
                  isLoading={loading}
                />
              )}
            </div>
          </>
        ) : mode === "builder" ? (
          <div className="w-full h-full">
            <ResumeBuilder
              theme={theme}
              onAnalyzeResume={(text) => {
                setMode("individual");
                setResults(null);
                setLoading(true);
                axios.post("http://localhost:5000/api/analyze-text", {
                  text,
                  jobId: null,
                  customJD: null,
                }).then((res) => {
                  setResults(res.data);
                  setLoading(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }).catch((err) => {
                  console.error("Builder analyze error:", err);
                  setError("Failed to analyze resume from builder.");
                  setLoading(false);
                });
              }}
            />
          </div>
        ) : mode === "cover_letter" ? (
          <div className="w-full h-full">
            <CoverLetterBuilder />
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black tracking-tight mb-4 text-slate-900 dark:text-white">
                Organization Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                Upload and rank multiple candidate resumes against a specific
                job role.
              </p>
            </div>
            <OrganizationDashboard theme={theme} />
          </div>
        )}
      </main>

      {/* Enterprise Footer (Rendered only on landing/audit/recruiter pages) */}
      {(mode === "individual" || mode === "organization") && (
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md pt-16 pb-12 px-6 mt-24 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Row: Brand & Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Column 1: Brand & Status */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 flex items-center justify-center shadow-sm">
                  <Layers className="text-white w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Astra<span className="text-indigo-600 dark:text-indigo-400 font-semibold ml-0.5">ATS</span>
                  </span>
                  <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 uppercase tracking-wider">
                    v2.4 Enterprise
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium max-w-md leading-relaxed">
                Next-generation neural resume parser and recruitment screening engine. Benchmarking candidates with verified TF-IDF vector models across 54+ industry roles.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Engine Nodes Active · 54 ML Models Loaded</span>
              </div>
            </div>

            {/* Column 2: Audit Engine */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                Core Capabilities
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <li
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  onClick={() => {
                    setMode("individual");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Candidate Audit (Single)
                </li>
                <li
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  onClick={() => {
                    setMode("builder");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  AI Resume Builder
                </li>
                <li
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  onClick={() => {
                    setMode("organization");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Recruiter Batch Pool
                </li>
                <li>54 Industry Sector Gazetteers</li>
                <li>Chronological Timeline Audit</li>
                <li>Executive PDF Export</li>
              </ul>
            </div>

            {/* Column 3: Standards & Compliance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                Standards & Compliance
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>ATS Format Compliant</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>TF-IDF Cosine Matcher</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Sub-15ms Scoring Latency</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Regex Gazetteers v2.4</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright, Theme quick toggle & Links */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Astra AI Resume Analyzer. Built for professionals.</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-white transition-colors font-bold"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-indigo-600 dark:hover:text-white transition-colors font-bold"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;
