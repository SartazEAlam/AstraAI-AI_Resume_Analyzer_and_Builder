import React from "react";

/* ── Modern Template ──
   Two-column sidebar design.
   Left sidebar: contact, skills, languages, certifications.
   Right main: summary, experience, education, projects. */

const ModernTemplate = ({ data, customization }) => {
  const accent = customization?.accentColor || "#4f46e5";
  const fontFamily = customization?.fontFamily || "'Inter', 'Segoe UI', sans-serif";
  const fontSize = customization?.fontSize || "default";
  
  // Noticeable scaling: 0.88x (compact) -> 1.05x (standard) -> 1.25x (large)
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

  const normalizedSkills = Array.isArray(skills)
    ? skills.filter((s) => typeof s === "string" && s.trim())
    : typeof skills === "string"
      ? skills.split(/[,;\n•·|]+/).map((s) => s.trim()).filter(Boolean)
      : [];

  // Count active sections to calculate adaptive spacing
  const mainSectionCount = [
    summary,
    experience.length > 0,
    education.length > 0,
    projects.length > 0,
  ].filter(Boolean).length;

  const isShortResume = mainSectionCount <= 2 && (experience.length <= 1);
  const mainGap = isShortResume ? (32 * sizeScale) : (22 * sizeScale);
  const sidebarGap = (normalizedSkills.length + languages.length + certifications.length <= 3) ? 28 : 20;

  /* Sidebar section heading */
  const SidebarTitle = ({ children }) => (
    <h2
      style={{
        fontSize: 10 * sizeScale,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.16em",
        color: "rgba(255,255,255,0.7)",
        margin: "0 0 10px 0",
        paddingBottom: 4,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        fontFamily,
      }}
    >
      {children}
    </h2>
  );

  /* Main content section heading */
  const SectionTitle = ({ children }) => (
    <h2
      style={{
        fontSize: 12 * sizeScale,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: accent,
        margin: "0 0 10px 0",
        paddingBottom: 6,
        borderBottom: `2px solid ${accent}25`,
        fontFamily,
      }}
    >
      {children}
    </h2>
  );

  return (
    <div
      className="resume-template resume-template-modern"
      style={{
        width: "210mm",
        minHeight: "297mm",
        display: "flex",
        background: "#ffffff",
        fontFamily,
        fontSize: `${10.5 * sizeScale}px`,
        lineHeight: 1.55,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* ── Left Sidebar ── */}
      <div
        style={{
          width: "32%",
          background: accent,
          color: "#ffffff",
          padding: "36px 22px 32px",
          display: "flex",
          flexDirection: "column",
          gap: sidebarGap,
          flexShrink: 0,
        }}
      >
        {/* Initials Avatar */}
        <div style={{ textAlign: "center", paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div
            style={{
              width: 68 * sizeScale,
              height: 68 * sizeScale,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.18)",
              margin: "0 auto 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24 * sizeScale,
              fontWeight: 800,
              color: "#ffffff",
              fontFamily,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            }}
          >
            {(personalInfo.fullName || "U")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </div>
          <h1
            style={{
              fontSize: 17 * sizeScale,
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 4px",
              fontFamily,
              letterSpacing: "0.01em",
              lineHeight: 1.25,
            }}
          >
            {personalInfo.fullName || "Your Name"}
          </h1>
        </div>

        {/* Contact */}
        <div>
          <SidebarTitle>Contact</SidebarTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 * sizeScale }}>
            {personalInfo.email && (
              <span style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.9)", wordBreak: "break-all", fontFamily, lineHeight: 1.35 }}>
                {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.9)", fontFamily }}>
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.location && (
              <span style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.9)", fontFamily }}>
                {personalInfo.location}
              </span>
            )}
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin} style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontFamily, borderBottom: "1px solid rgba(255,255,255,0.25)" }} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            )}
            {personalInfo.portfolio && (
              <a href={personalInfo.portfolio} style={{ fontSize: 9.5 * sizeScale, color: "rgba(255,255,255,0.85)", textDecoration: "none", fontFamily, borderBottom: "1px solid rgba(255,255,255,0.25)" }} target="_blank" rel="noopener noreferrer">
                Portfolio ↗
              </a>
            )}
          </div>
        </div>

        {/* Skills */}
        {normalizedSkills.length > 0 && (
          <div>
            <SidebarTitle>Skills</SidebarTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {normalizedSkills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 9 * sizeScale,
                    fontWeight: 600,
                    padding: "3px 11px",
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.95)",
                    fontFamily,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <SidebarTitle>Languages</SidebarTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {languages.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9.5 * sizeScale, color: "#ffffff", fontFamily, fontWeight: 500 }}>{l.language}</span>
                  {l.proficiency && <span style={{ fontSize: 8.5 * sizeScale, color: "rgba(255,255,255,0.65)", fontFamily, fontWeight: 500 }}>{l.proficiency}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div>
            <SidebarTitle>Certifications</SidebarTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {certifications.map((cert, i) => (
                <div key={i}>
                  <span style={{ fontSize: 9.5 * sizeScale, fontWeight: 600, color: "#ffffff", fontFamily, lineHeight: 1.35, display: "block" }}>{cert.name}</span>
                  {(cert.issuer || cert.year) && (
                    <div style={{ fontSize: 8.5 * sizeScale, color: "rgba(255,255,255,0.65)", fontFamily, marginTop: 1 }}>
                      {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right Main Content ── */}
      <div
        style={{
          flex: 1,
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: mainGap,
          justifyContent: "flex-start",
        }}
      >
        {/* Summary */}
        {summary && (
          <div>
            <SectionTitle>Professional Summary</SectionTitle>
            <p style={{ fontSize: 10.5 * sizeScale, lineHeight: 1.7, color: "#374151", margin: 0, fontFamily }}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <SectionTitle>Work Experience</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 * sizeScale }}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 12.5 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{exp.title || "Position"}</h3>
                    <span style={{ fontSize: 9.5 * sizeScale, color: "#9ca3af", fontFamily, fontWeight: 600, fontStyle: "italic" }}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                  {exp.company && (
                    <p style={{ fontSize: 10.5 * sizeScale, color: accent, fontWeight: 600, margin: "2px 0 0", fontFamily }}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </p>
                  )}
                  {exp.bullets?.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16, listStyleType: "disc" }}>
                      {exp.bullets.map((b, j) => b.trim() ? (
                        <li key={j} style={{ fontSize: 10 * sizeScale, lineHeight: 1.6, color: "#4b5563", marginBottom: 2, fontFamily }}>{b}</li>
                      ) : null)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <SectionTitle>Education</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
              {education.map((edu, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 12 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{edu.degree || "Degree"}</h3>
                    <span style={{ fontSize: 9.5 * sizeScale, color: "#9ca3af", fontFamily, fontStyle: "italic" }}>{edu.year}</span>
                  </div>
                  <p style={{ fontSize: 10.5 * sizeScale, color: "#6b7280", margin: "2px 0 0", fontFamily }}>
                    {edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
              {projects.map((proj, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 12 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{proj.name || "Project"}</h3>
                    {proj.techStack && <span style={{ fontSize: 9 * sizeScale, color: accent, fontFamily, fontWeight: 600 }}>({proj.techStack})</span>}
                  </div>
                  {proj.description && <p style={{ fontSize: 10.5 * sizeScale, color: "#4b5563", margin: "3px 0 0", lineHeight: 1.6, fontFamily }}>{proj.description}</p>}
                  {proj.link && <a href={proj.link} style={{ fontSize: 9 * sizeScale, color: accent, fontFamily, textDecoration: "none", borderBottom: `1px solid ${accent}44` }} target="_blank" rel="noopener noreferrer">{proj.link}</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
