import React from "react";

/* ── Executive Template ──
   Single-column layout with a bold dark header banner.
   Name displayed prominently in white on accent-colored header.
   Designed for senior roles, management, and leadership positions.
   Fully ATS-parseable: real text, no images/icons. */

const ExecutiveTemplate = ({ data, customization }) => {
  const accent = customization?.accentColor || "#1e293b";
  const fontFamily = customization?.fontFamily || "'Inter', 'Segoe UI', sans-serif";
  const fontSize = customization?.fontSize || "default";
  const sizeScale = fontSize === "small" ? 0.88 : fontSize === "large" ? 1.25 : 1.05;

  const {
    personalInfo = {},
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
  } = data || {};

  const sectionOrder = customization?.sectionOrder || [
    "summary", "experience", "education", "skills", "projects", "certifications", "languages",
  ];

  const normalizedSkills = Array.isArray(skills)
    ? skills.filter((s) => typeof s === "string" && s.trim())
    : typeof skills === "string"
      ? skills.split(/[,;\n•·|]+/).map((s) => s.trim()).filter(Boolean)
      : [];

  /* Section heading with bottom accent line */
  const SectionDivider = ({ title }) => (
    <div style={{ marginTop: 24 * sizeScale, marginBottom: 12 * sizeScale }}>
      <h2
        style={{
          fontSize: 13.5 * sizeScale,
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: accent,
          margin: 0,
          paddingBottom: 8,
          borderBottom: `2.5px solid ${accent}`,
          fontFamily,
        }}
      >
        {title}
      </h2>
    </div>
  );

  const renderSection = (key) => {
    switch (key) {
      case "summary":
        return summary ? (
          <div key="summary">
            <SectionDivider title="Executive Summary" />
            <p style={{ fontSize: 10.5 * sizeScale, lineHeight: 1.75, color: "#374151", margin: 0, fontFamily }}>{summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key="experience">
            <SectionDivider title="Professional Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 * sizeScale }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 13 * sizeScale, fontWeight: 800, color: "#111827", margin: 0, fontFamily }}>{exp.title || "Position"}</h3>
                    <span style={{ fontSize: 9.5 * sizeScale, color: "#6b7280", fontFamily, fontWeight: 600, fontStyle: "italic" }}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                  {exp.company && (
                    <p style={{ fontSize: 11 * sizeScale, color: accent, fontWeight: 700, margin: "3px 0 0", fontFamily }}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </p>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, listStyleType: "disc" }}>
                      {exp.bullets.map((b, j) => b.trim() ? (
                        <li key={j} style={{ fontSize: 10.5 * sizeScale, lineHeight: 1.65, color: "#374151", marginBottom: 3, fontFamily }}>{b}</li>
                      ) : null)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <div key="education">
            <SectionDivider title="Education" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 * sizeScale }}>
              {education.map((edu, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ fontSize: 12 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{edu.degree || "Degree"}</h3>
                    <p style={{ fontSize: 10.5 * sizeScale, color: "#6b7280", margin: "2px 0 0", fontFamily }}>
                      {edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                    </p>
                  </div>
                  <span style={{ fontSize: 9.5 * sizeScale, color: "#9ca3af", fontFamily, fontStyle: "italic" }}>{edu.year || ""}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return normalizedSkills.length > 0 ? (
          <div key="skills">
            <SectionDivider title="Core Competencies" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {normalizedSkills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 9.5 * sizeScale,
                    fontWeight: 600,
                    padding: "4px 14px",
                    borderRadius: 4,
                    background: `${accent}10`,
                    border: `1.5px solid ${accent}30`,
                    color: "#1f2937",
                    fontFamily,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key="projects">
            <SectionDivider title="Key Projects" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
              {projects.map((proj, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 12 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{proj.name || "Project"}</h3>
                    {proj.techStack && <span style={{ fontSize: 9 * sizeScale, color: accent, fontFamily, fontWeight: 600 }}>({proj.techStack})</span>}
                  </div>
                  {proj.description && <p style={{ fontSize: 10.5 * sizeScale, color: "#374151", margin: "3px 0 0", lineHeight: 1.6, fontFamily }}>{proj.description}</p>}
                  {proj.link && <a href={proj.link} style={{ fontSize: 9.5 * sizeScale, color: accent, fontFamily, textDecoration: "none", borderBottom: `1px solid ${accent}44` }} target="_blank" rel="noopener noreferrer">{proj.link}</a>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "certifications":
        return certifications.length > 0 ? (
          <div key="certifications">
            <SectionDivider title="Certifications" />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {certifications.map((cert, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 10.5 * sizeScale, fontWeight: 600, color: "#111827", fontFamily }}>{cert.name || "Certification"}{cert.issuer ? ` — ${cert.issuer}` : ""}</span>
                  {cert.year && <span style={{ fontSize: 9.5 * sizeScale, color: "#9ca3af", fontFamily, fontStyle: "italic" }}>{cert.year}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <div key="languages">
            <SectionDivider title="Languages" />
            <p style={{ fontSize: 10.5 * sizeScale, color: "#374151", fontFamily, margin: 0, lineHeight: 1.7 }}>
              {languages.map((l) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  ·  ")}
            </p>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div
      className="resume-template resume-template-executive"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        fontFamily,
        fontSize: `${10.5 * sizeScale}px`,
        lineHeight: 1.5,
        boxSizing: "border-box",
      }}
    >
      {/* ── Dark Header Banner ── */}
      <div
        style={{
          background: accent,
          padding: `${32 * sizeScale}px 40px ${28 * sizeScale}px`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 30 * sizeScale,
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontFamily,
          }}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 0", marginTop: 10, fontSize: 10 * sizeScale, color: "rgba(255,255,255,0.85)", fontFamily }}>
          {[personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).map((item, i, arr) => (
            <React.Fragment key={i}>
              <span>{item}</span>
              {i < arr.length - 1 && <span style={{ margin: "0 12px", color: "rgba(255,255,255,0.4)" }}>|</span>}
            </React.Fragment>
          ))}
        </div>
        {(personalInfo.linkedin || personalInfo.portfolio) && (
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "4px 18px", marginTop: 6 }}>
            {personalInfo.linkedin && <a href={personalInfo.linkedin} style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.75)", fontFamily, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.3)" }} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {personalInfo.portfolio && <a href={personalInfo.portfolio} style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.75)", fontFamily, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.3)" }} target="_blank" rel="noopener noreferrer">Portfolio</a>}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "20px 40px 36px" }}>
        {sectionOrder.map((key) => renderSection(key))}
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
