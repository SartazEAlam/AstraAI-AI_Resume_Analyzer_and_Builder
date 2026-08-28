import React, { useState } from "react";
import { Palette, Type, ZoomIn } from "lucide-react";

const ACCENT_COLORS = [
  { id: "indigo", hex: "#4f46e5", label: "Indigo" },
  { id: "blue", hex: "#2563eb", label: "Blue" },
  { id: "emerald", hex: "#059669", label: "Emerald" },
  { id: "violet", hex: "#7c3aed", label: "Violet" },
  { id: "rose", hex: "#e11d48", label: "Rose" },
  { id: "amber", hex: "#d97706", label: "Amber" },
  { id: "slate", hex: "#334155", label: "Slate" },
  { id: "cyan", hex: "#0891b2", label: "Cyan" },
  { id: "fuchsia", hex: "#c026d3", label: "Fuchsia" },
  { id: "teal", hex: "#0d9488", label: "Teal" },
];

export const FONT_OPTIONS = [
  // ── Sans-Serif (Clean, Modern & Universal ATS) ──
  { id: "inter", family: "'Inter', sans-serif", label: "Inter", style: "Clean Tech", category: "sans" },
  { id: "roboto", family: "'Roboto', sans-serif", label: "Roboto", style: "ATS Standard", category: "sans" },
  { id: "jakarta", family: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta", style: "Geometric", category: "sans" },
  { id: "outfit", family: "'Outfit', sans-serif", label: "Outfit", style: "Modern Exec", category: "sans" },
  { id: "poppins", family: "'Poppins', sans-serif", label: "Poppins", style: "Contemporary", category: "sans" },
  { id: "montserrat", family: "'Montserrat', sans-serif", label: "Montserrat", style: "Bold Header", category: "sans" },
  { id: "lato", family: "'Lato', sans-serif", label: "Lato", style: "Corporate", category: "sans" },
  { id: "open-sans", family: "'Open Sans', sans-serif", label: "Open Sans", style: "Neutral Open", category: "sans" },

  // ── Serif (Editorial, Traditional & Executive) ──
  { id: "merriweather", family: "'Merriweather', serif", label: "Merriweather", style: "Editorial Serif", category: "serif" },
  { id: "lora", family: "'Lora', serif", label: "Lora", style: "Classic Literary", category: "serif" },
  { id: "playfair", family: "'Playfair Display', serif", label: "Playfair Display", style: "Luxury Elegance", category: "serif" },
  { id: "georgia", family: "'Georgia', serif", label: "Georgia", style: "Formal Traditional", category: "serif" },

  // ── Monospace (Technical, Code & Engineering) ──
  { id: "roboto-mono", family: "'Roboto Mono', monospace", label: "Roboto Mono", style: "Developer Mono", category: "mono" },
  { id: "jetbrains-mono", family: "'JetBrains Mono', monospace", label: "JetBrains Mono", style: "Clean Code", category: "mono" },
];

const FONT_SIZES = [
  { id: "small", label: "Small (Compact)" },
  { id: "default", label: "Default (Standard)" },
  { id: "large", label: "Large (Prominent)" },
];

const TemplateCustomizer = ({ customization, onChange }) => {
  const [fontCategory, setFontCategory] = useState("all");

  const update = (field, value) => onChange({ ...customization, [field]: value });

  const filteredFonts = FONT_OPTIONS.filter((f) => {
    if (fontCategory === "all") return true;
    return f.category === fontCategory;
  });

  return (
    <div className="space-y-5">
      {/* ── Accent Color ── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Palette className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Accent Color</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => update("accentColor", color.hex)}
              title={color.label}
              className="relative group"
            >
              <div
                className={`w-7 h-7 rounded-lg transition-all ${
                  customization.accentColor === color.hex
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110"
                    : "hover:scale-110"
                }`}
                style={{
                  backgroundColor: color.hex,
                  boxShadow: customization.accentColor === color.hex ? `0 0 0 2px ${color.hex}` : undefined,
                }}
              />
              {customization.accentColor === color.hex && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-[10px] font-black">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Font Family Styles ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Typography ({filteredFonts.length})</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
            {[
              { id: "all", label: "All" },
              { id: "sans", label: "Sans" },
              { id: "serif", label: "Serif" },
              { id: "mono", label: "Mono" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFontCategory(cat.id)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  fontCategory === cat.id
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 builder-form-scrollbar">
          {filteredFonts.map((font) => {
            const isSelected = customization.fontFamily === font.family;
            return (
              <button
                key={font.id}
                onClick={() => update("fontFamily", font.family)}
                className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-400 dark:border-indigo-600 text-indigo-800 dark:text-indigo-200 shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight" style={{ fontFamily: font.family }}>
                    {font.label}
                  </span>
                  {isSelected && <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">✓</span>}
                </div>
                <div className="flex items-center justify-between mt-1 text-[9px]">
                  <span className="text-slate-400 dark:text-slate-400 font-medium">{font.style}</span>
                  <span className="uppercase text-[8px] font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400">
                    {font.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Font Size Scale ── */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <ZoomIn className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Font Sizing Scale</span>
        </div>
        <div className="flex gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => update("fontSize", size.id)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                customization.fontSize === size.id
                  ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateCustomizer;
