import React, { useState } from "react";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderOpen,
  Award,
  Globe,
  FileText,
  Plus,
  Trash2,
  ChevronRight
} from "lucide-react";

/* ── Form Input Helper ── */
const Input = ({ label, value, onChange, placeholder, type = "text", ...props }) => (
  <div className="space-y-1 relative group">
    {label && (
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 transition-colors group-focus-within:text-indigo-500">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
      {...props}
    />
  </div>
);

/* ── Textarea ── */
const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="space-y-1 relative group">
    {label && (
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 transition-colors group-focus-within:text-indigo-500">
        {label}
      </label>
    )}
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-y placeholder:text-slate-400 dark:placeholder:text-slate-500"
    />
  </div>
);

/* ── Tabs Configuration ── */
const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "languages", label: "Languages", icon: Globe },
];

/* ── Main Resume Form Component ── */
const ResumeForm = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState("personal");

  const update = (field, value) => onChange({ ...data, [field]: value });

  const updatePersonal = (field, value) =>
    update("personalInfo", { ...data.personalInfo, [field]: value });

  /* ── Array field helpers ── */
  const addItem = (field, template) =>
    update(field, [...(data[field] || []), template]);

  const removeItem = (field, index) =>
    update(field, (data[field] || []).filter((_, i) => i !== index));

  const updateItem = (field, index, newData) =>
    update(
      field,
      (data[field] || []).map((item, i) => (i === index ? { ...item, ...newData } : item))
    );

  /* ── Bullet helpers ── */
  const addBullet = (expIndex) => {
    const exp = [...(data.experience || [])];
    exp[expIndex] = { ...exp[expIndex], bullets: [...(exp[expIndex].bullets || []), ""] };
    update("experience", exp);
  };

  const updateBullet = (expIndex, bulletIndex, value) => {
    const exp = [...(data.experience || [])];
    const bullets = [...(exp[expIndex].bullets || [])];
    bullets[bulletIndex] = value;
    exp[expIndex] = { ...exp[expIndex], bullets };
    update("experience", exp);
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const exp = [...(data.experience || [])];
    exp[expIndex] = {
      ...exp[expIndex],
      bullets: exp[expIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    update("experience", exp);
  };



  /* ── Skills tag input ── */
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const raw = skillInput.trim();
    if (!raw) return;
    const currentSkills = Array.isArray(data.skills) 
      ? data.skills 
      : (typeof data.skills === 'string' ? data.skills.split(/[,;\n•|]+/).map(s => s.trim()).filter(Boolean) : []);

    const newItems = raw
      .split(/[,;\n•|]+/)
      .map((s) => s.trim())
      .filter((s) => s && !currentSkills.includes(s));

    if (newItems.length > 0) {
      update("skills", [...currentSkills, ...newItems]);
      setSkillInput("");
    }
  };

  const removeSkill = (index) => {
    const currentSkills = Array.isArray(data.skills) 
      ? data.skills 
      : (typeof data.skills === 'string' ? data.skills.split(/[,;\n•|]+/).map(s => s.trim()).filter(Boolean) : []);
    update("skills", currentSkills.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* ── Sidebar Navigation ── */}
      <div className="w-full md:w-48 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 builder-form-scrollbar border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 md:pr-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"}`} />
                {tab.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50 hidden md:block" />}
            </button>
          );
        })}
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-y-auto pb-6 builder-form-scrollbar pr-2">
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          
          {/* PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name" value={data.personalInfo?.fullName} onChange={(v) => updatePersonal("fullName", v)} placeholder="John Doe" />
                </div>
                <Input label="Email" type="email" value={data.personalInfo?.email} onChange={(v) => updatePersonal("email", v)} placeholder="john@example.com" />
                <Input label="Phone" value={data.personalInfo?.phone} onChange={(v) => updatePersonal("phone", v)} placeholder="+91 98765 43210" />
                <Input label="Location" value={data.personalInfo?.location} onChange={(v) => updatePersonal("location", v)} placeholder="Mumbai, India" />
                <Input label="LinkedIn" value={data.personalInfo?.linkedin} onChange={(v) => updatePersonal("linkedin", v)} placeholder="linkedin.com/in/johndoe" />
                <div className="sm:col-span-2">
                  <Input label="Portfolio / Website" value={data.personalInfo?.portfolio} onChange={(v) => updatePersonal("portfolio", v)} placeholder="https://johndoe.com" />
                </div>
              </div>
            </div>
          )}

          {/* SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Professional Summary</h2>
              </div>
              <TextArea
                label="Professional Summary"
                value={data.summary}
                onChange={(v) => update("summary", v)}
                placeholder="Brief overview of your professional background and goals..."
                rows={4}
              />
            </div>
          )}

          {/* EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Work Experience</h2>
                <button
                  onClick={() => addItem("experience", { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Job
                </button>
              </div>

              {(data.experience || []).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No work experience added yet.</div>
              )}

              {(data.experience || []).map((exp, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => removeItem("experience", i)} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <Input label="Job Title" value={exp.title} onChange={(v) => updateItem("experience", i, { title: v })} placeholder="Software Engineer" />
                    <Input label="Company" value={exp.company} onChange={(v) => updateItem("experience", i, { company: v })} placeholder="Google" />
                    <Input label="Location" value={exp.location} onChange={(v) => updateItem("experience", i, { location: v })} placeholder="Mountain View, CA" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Start Date" value={exp.startDate} onChange={(v) => updateItem("experience", i, { startDate: v })} placeholder="Jan 2020" />
                      <Input label="End Date" value={exp.endDate} onChange={(v) => updateItem("experience", i, { endDate: v })} placeholder="Present" />
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Responsibilities / Achievements</label>
                    {(exp.bullets || []).map((bullet, j) => (
                      <div key={j} className="flex gap-2 relative group/bullet">
                        <div className="flex-1">
                          <TextArea
                            value={bullet}
                            onChange={(v) => updateBullet(i, j, v)}
                            placeholder="Developed and maintained web applications..."
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-col gap-1 mt-1 opacity-0 group-hover/bullet:opacity-100 transition-opacity">

                          <button onClick={() => removeBullet(i, j)} title="Remove Bullet" className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => addBullet(i)} className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                      <Plus className="w-3 h-3" /> Add Bullet Point
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDUCATION */}
          {activeTab === "education" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Education</h2>
                <button
                  onClick={() => addItem("education", { degree: "", institution: "", year: "", gpa: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>

              {(data.education || []).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No education added yet.</div>
              )}

              {(data.education || []).map((edu, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => removeItem("education", i)} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <div className="sm:col-span-2">
                      <Input label="Degree / Course" value={edu.degree} onChange={(v) => updateItem("education", i, { degree: v })} placeholder="B.S. in Computer Science" />
                    </div>
                    <Input label="Institution" value={edu.institution} onChange={(v) => updateItem("education", i, { institution: v })} placeholder="Stanford University" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Year" value={edu.year} onChange={(v) => updateItem("education", i, { year: v })} placeholder="2020 - 2024" />
                      <Input label="GPA" value={edu.gpa} onChange={(v) => updateItem("education", i, { gpa: v })} placeholder="3.8/4.0" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Technical & Core Skills</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {((Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(/[,;\n•|]+/).map(s => s.trim()).filter(Boolean) : []))).length} skills added
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. React, Python, Docker)..."
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm font-medium focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                />
                <button
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold transition-colors shadow-md shadow-indigo-500/20"
                >
                  Add Skill
                </button>
              </div>

              {/* Quick Suggested Skill Chips */}
              <div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">Suggested Skills (Click to add):</span>
                <div className="flex flex-wrap gap-1.5">
                  {["React", "TypeScript", "JavaScript", "Python", "Node.js", "SQL", "Tailwind CSS", "Git", "Docker", "REST APIs", "AWS", "Agile / Scrum", "GraphQL", "Next.js", "Problem Solving", "Leadership"].map((suggested) => {
                    const currentSkills = Array.isArray(data.skills) 
                      ? data.skills 
                      : (typeof data.skills === 'string' ? data.skills.split(/[,;\n•|]+/).map(s => s.trim()).filter(Boolean) : []);
                    const isAdded = currentSkills.includes(suggested);
                    if (isAdded) return null;
                    return (
                      <button
                        key={suggested}
                        onClick={() => {
                          update("skills", [...currentSkills, suggested]);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 transition-all"
                      >
                        + {suggested}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {((Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(/[,;\n•|]+/).map(s => s.trim()).filter(Boolean) : []))).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-semibold border border-indigo-200 dark:border-indigo-800/50 group"
                  >
                    {skill}
                    <button onClick={() => removeSkill(i)} className="hover:text-rose-500 transition-colors ml-1 opacity-70 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Projects</h2>
                <button
                  onClick={() => addItem("projects", { name: "", description: "", techStack: "", link: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {(data.projects || []).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No projects added yet.</div>
              )}

              {(data.projects || []).map((proj, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => removeItem("projects", i)} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-8">
                    <Input label="Project Name" value={proj.name} onChange={(v) => updateItem("projects", i, { name: v })} placeholder="AI Resume Analyzer" />
                    <Input label="Tech Stack" value={proj.techStack} onChange={(v) => updateItem("projects", i, { techStack: v })} placeholder="React, Node.js, Python" />
                    <div className="sm:col-span-2">
                      <TextArea label="Description" value={proj.description} onChange={(v) => updateItem("projects", i, { description: v })} placeholder="Built a full-stack AI-powered resume analyzer..." rows={3} />
                    </div>
                    <div className="sm:col-span-2">
                      <Input label="Link" value={proj.link} onChange={(v) => updateItem("projects", i, { link: v })} placeholder="https://github.com/user/project" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CERTIFICATIONS */}
          {activeTab === "certifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Certifications</h2>
                <button
                  onClick={() => addItem("certifications", { name: "", issuer: "", year: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Certification
                </button>
              </div>

              {(data.certifications || []).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No certifications added yet.</div>
              )}

              {(data.certifications || []).map((cert, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                  <button onClick={() => removeItem("certifications", i)} className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-8">
                    <div className="sm:col-span-2">
                      <Input label="Name" value={cert.name} onChange={(v) => updateItem("certifications", i, { name: v })} placeholder="AWS Solutions Architect" />
                    </div>
                    <Input label="Issuer" value={cert.issuer} onChange={(v) => updateItem("certifications", i, { issuer: v })} placeholder="Amazon" />
                    <Input label="Year" value={cert.year} onChange={(v) => updateItem("certifications", i, { year: v })} placeholder="2024" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LANGUAGES */}
          {activeTab === "languages" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Languages</h2>
                <button
                  onClick={() => addItem("languages", { language: "", proficiency: "" })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Language
                </button>
              </div>

              {(data.languages || []).length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">No languages added yet.</div>
              )}

              <div className="space-y-3">
                {(data.languages || []).map((lang, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label={i === 0 ? "Language" : undefined} value={lang.language} onChange={(v) => updateItem("languages", i, { language: v })} placeholder="English" />
                      <Input label={i === 0 ? "Proficiency" : undefined} value={lang.proficiency} onChange={(v) => updateItem("languages", i, { proficiency: v })} placeholder="Native / Fluent" />
                    </div>
                    <button onClick={() => removeItem("languages", i)} className={`p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-400 hover:text-rose-600 transition-colors ${i === 0 ? 'mt-6' : 'mt-0'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ResumeForm;
