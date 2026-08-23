import React from 'react';
import { Mail, Sparkles, Building2, User, ChevronDown } from 'lucide-react';

const TONES = [
  { id: 'Professional', label: 'Professional (Standard)' },
  { id: 'Enthusiastic', label: 'Enthusiastic (Startups)' },
  { id: 'Confident', label: 'Confident (Sales / Impact)' },
  { id: 'Executive', label: 'Executive (Leadership)' }
];

export default function CoverLetterForm({ formData, setFormData, onGenerate, isGenerating }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0b0f19] border-r border-slate-200 dark:border-slate-800">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-[#0b0f19] z-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-indigo-500" />
          Letter Details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Provide the target role details and let AI tailor your letter.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <User className="w-4 h-4 text-slate-400" /> Your Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="e.g. jane@example.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Your Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="e.g. +1 234 567 890"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-slate-400" /> Target Role & Company
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Job Title</label>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                name="targetCompany"
                value={formData.targetCompany}
                onChange={handleChange}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Company Address (Optional)</label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress || ''}
                onChange={handleChange}
                placeholder="e.g. 1600 Amphitheatre Pkwy"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Hiring Manager (Optional)</label>
              <input
                type="text"
                name="hiringManager"
                value={formData.hiringManager || ''}
                onChange={handleChange}
                placeholder="e.g. John Doe or Hiring Team"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tone of Voice</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TONES.map(tone => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tone: tone.id }))}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition-all border ${
                      formData.tone === tone.id
                        ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {tone.label.split(' ')[0]}
                    <span className="block text-[10px] font-normal opacity-70">{tone.label.includes('(') ? tone.label.split('(')[1].replace(')', '') : ''}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Text Alignment</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'left', label: 'Left' },
                  { id: 'center', label: 'Center' },
                  { id: 'justify', label: 'Justify' }
                ].map(align => (
                  <button
                    key={align.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, letterAlignment: align.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      (formData.letterAlignment || 'left') === align.id
                        ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {align.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={isGenerating || !formData.targetRole || !formData.targetCompany}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Generating Cover Letter...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-200" />
              Auto-Tailor with AI
            </>
          )}
        </button>

        {/* Letter Editor */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" /> Letter Content
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const sample = `Dear Hiring Team at ${formData.targetCompany || 'the Company'},\n\nI am writing to express my strong interest in the ${formData.targetRole || 'open'} position. With my background in high-impact software development and system architecture, I am confident in my ability to deliver substantial value to your engineering organization.\n\nThroughout my career, I have specialized in building scalable, resilient applications and collaborating closely with cross-functional teams to solve challenging technical problems. I admire ${formData.targetCompany || 'your team'}'s dedication to innovation and believe my skills align seamlessly with your current goals.\n\nThank you for your time and consideration. I welcome the opportunity to discuss how my qualifications meet your team's needs in greater detail.\n\nSincerely,\n${formData.name || 'Candidate'}`;
                  setFormData(prev => ({ ...prev, letterContent: sample }));
                }}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Insert Sample
              </button>
            </div>
          </div>
          
          <div>
            <textarea
              name="letterContent"
              value={formData.letterContent}
              onChange={handleChange}
              placeholder="Your cover letter content will appear here... (You can edit or type directly)"
              className="w-full h-80 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed font-sans"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 px-1">
              <span>{(formData.letterContent || "").split(/\s+/).filter(Boolean).length} words</span>
              <span>{(formData.letterContent || "").length} characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
