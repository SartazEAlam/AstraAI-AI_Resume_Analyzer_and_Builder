import React from "react";
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

const FONT_OPTIONS = [
  { id: "inter", family: "'Inter', sans-serif", label: "Inter (Clean)" },
  { id: "outfit", family: "'Outfit', sans-serif", label: "Outfit (Modern)" },
  { id: "jakarta", family: "'Plus Jakarta Sans', sans-serif", label: "Jakarta (Geometric)" },
  { id: "merriweather", family: "'Merriweather', serif", label: "Merriweather (Serif)" },
  { id: "poppins", family: "'Poppins', sans-serif", label: "Poppins (Rounded)" },
  { id: "roboto-mono", family: "'Roboto Mono', monospace", label: "Mono (Technical)" },
];

const FONT_SIZES = [
  { id: "small", label: "Small (Compact)" },
  { id: "default", label: "Default (Standard)" },
  { id: "large", label: "Large (Prominent)" },
];

const TemplateCustomizer = ({ customization, onChange }) => {
  const update = (field, value) => onChange({ ...customization, [field]: value });

  return (
    <div className="space-y-5">
      {/* Accent Color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
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
                  ringColor: color.hex,
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

      {/* Font Family */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Font</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.id}
              onClick={() => update("fontFamily", font.family)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                customization.fontFamily === font.family
                  ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600"
              }`}
              style={{ fontFamily: font.family }}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ZoomIn className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Size</span>
        </div>
        <div className="flex gap-2">
          {FONT_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => update("fontSize", size.id)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                customization.fontSize === size.id
                  ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
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
