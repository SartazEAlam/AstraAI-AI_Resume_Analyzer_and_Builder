import React from "react";

/* ── Professional Template ──
   Single-column, left-aligned with structured section layout.
   Contact info on the right side of the header.
   Each section has a subtle accent-colored left bar.
   Skills displayed in a structured two-column grid.
   Most traditional ATS-safe format — universally compatible. */

const ProfessionalTemplate = ({ data, customization }) => {
  const accent = customization?.accentColor || "#0d9488";
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

  /* Section heading with left accent bar */
  const SectionDivider = ({ title }) => (
    <div style={{ marginTop: 20 * sizeScale, marginBottom: 10 * sizeScale }}>
      <h2
        style={{
          fontSize: 12 * sizeScale,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#1f2937",
          margin: 0,
          paddingBottom: 6,
          paddingLeft: 14,
          borderLeft: `3px solid ${accent}`,
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
            <SectionDivider title="Profile" />
            <p style={{ fontSize: 10.5 * sizeScale, lineHeight: 1.7, color: "#374151", margin: 0, fontFamily }}>{summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key="experience">
            <SectionDivider title="Work Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 * sizeScale }}>
              {experience.map((exp, i) => (
                <div key={i} style={{ paddingLeft: 14, borderLeft: `2px solid ${accent}15` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 12.5 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{exp.title || "Position"}</h3>
                    <span style={{ fontSize: 9.5 * sizeScale, color: "#9ca3af", fontFamily, fontWeight: 500, fontStyle: "italic" }}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                  {exp.company && (
                    <p style={{ fontSize: 10.5 * sizeScale, color: accent, fontWeight: 600, margin: "3px 0 0", fontFamily }}>
                      {exp.company}{exp.location ? `, ${exp.location}` : ""}
                    </p>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
                      {exp.bullets.map((b, j) => b.trim() ? (
                        <li key={j} style={{ fontSize: 10.5 * sizeScale, lineHeight: 1.6, color: "#374151", marginBottom: 3, fontFamily }}>{b}</li>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
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
            <SectionDivider title="Skills" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: `${4 * sizeScale}px ${24 * sizeScale}px`,
              }}
            >
              {normalizedSkills.map((skill, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 10 * sizeScale,
                    color: "#374151",
                    fontFamily,
                    fontWeight: 500,
                    paddingLeft: 10,
                    borderLeft: `2px solid ${accent}30`,
                    lineHeight: 1.8,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key="projects">
            <SectionDivider title="Projects" />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
              {projects.map((proj, i) => (
                <div key={i} style={{ paddingLeft: 14, borderLeft: `2px solid ${accent}15` }}>
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
      className="resume-template resume-template-professional"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "36px 40px",
        background: "#ffffff",
        color: "#111827",
        fontFamily,
        fontSize: `${10.5 * sizeScale}px`,
        lineHeight: 1.5,
        boxSizing: "border-box",
      }}
    >
      {/* ── Header with name left, contact right ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", paddingBottom: 16, borderBottom: `2px solid ${accent}` }}>
        <div>
          <h1
            style={{
              fontSize: 26 * sizeScale,
              fontWeight: 800,
              color: "#111827",
              margin: 0,
              letterSpacing: "0.01em",
              fontFamily,
            }}
          >
            {personalInfo.fullName || "Your Name"}
          </h1>
          {(personalInfo.linkedin || personalInfo.portfolio) && (
            <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
              {personalInfo.linkedin && <a href={personalInfo.linkedin} style={{ fontSize: 9.5 * sizeScale, color: accent, fontFamily, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {personalInfo.portfolio && <a href={personalInfo.portfolio} style={{ fontSize: 9.5 * sizeScale, color: accent, fontFamily, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Portfolio</a>}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", fontSize: 10 * sizeScale, color: "#6b7280", fontFamily, lineHeight: 1.7 }}>
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      {/* ── Dynamic Sections ── */}
      {sectionOrder.map((key) => renderSection(key))}
    </div>
  );
};

export default ProfessionalTemplate;
