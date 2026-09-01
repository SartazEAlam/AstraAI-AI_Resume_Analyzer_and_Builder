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
  {
    id: "sans",
    family: "'Inter', sans-serif",
    label: "Sans-Serif",
    fontName: "Inter",
    style: "Clean Modern",
    glyph: "Aa",
    category: "sans",
    badge: "ATS Standard",
  },
  {
    id: "serif",
    family: "'Merriweather', serif",
    label: "Serif",
    fontName: "Merriweather",
    style: "Executive Editorial",
    glyph: "Aa",
    category: "serif",
    badge: "Editorial",
  },
  {
    id: "mono",
    family: "'JetBrains Mono', monospace",
    label: "Monospace",
    fontName: "JetBrains Mono",
    style: "Technical Code",
    glyph: ">_",
    category: "mono",
    badge: "Developer",
  },
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

      {/* ── Typography Archetypes (3 Distinct Styles) ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Typography Style
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            3 Distinct Options
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {FONT_OPTIONS.map((font) => {
            const currentFont = (customization.fontFamily || "").toLowerCase();
            const isSelected =
              customization.fontFamily === font.family ||
              (font.id === "sans" && currentFont.includes("sans-serif")) ||
              (font.id === "serif" && currentFont.includes("serif") && !currentFont.includes("sans-serif")) ||
              (font.id === "mono" && currentFont.includes("mono"));

            return (
              <button
                key={font.id}
                onClick={() => update("fontFamily", font.family)}
                className={`relative p-3 rounded-2xl text-left transition-all border flex flex-col justify-between group overflow-hidden ${
                  isSelected
                    ? "bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 text-slate-900 dark:text-white shadow-md ring-2 ring-indigo-500/20"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs"
                }`}
              >
                {/* Top: Glyph Preview & Check */}
                <div className="flex items-start justify-between w-full mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold transition-transform group-hover:scale-105 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.glyph}
                  </div>
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {font.id}
                    </span>
                  )}
                </div>

                {/* Middle: Font Labels */}
                <div>
                  <div className="text-xs font-bold leading-tight" style={{ fontFamily: font.family }}>
                    {font.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {font.fontName}
                  </div>
                </div>

                {/* Bottom: Style Badge */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between w-full">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    {font.style}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected
                        ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                        : "bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {font.badge}
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
