import React from "react";

/* ── Compact Template ──
   Dense two-column layout: main content left (65%), sidebar right (35%).
   No colored sidebar background — uses light borders for ATS safety.
   Skills displayed as plain comma-separated list (most ATS-parseable).
   Designed for engineers, data scientists, and content-heavy resumes. */

const CompactTemplate = ({ data, customization }) => {
  const accent = customization?.accentColor || "#2563eb";
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

  const normalizedSkills = Array.isArray(skills)
    ? skills.filter((s) => typeof s === "string" && s.trim())
    : typeof skills === "string"
      ? skills.split(/[,;\n•·|]+/).map((s) => s.trim()).filter(Boolean)
      : [];

  /* Compact section heading */
  const SectionTitle = ({ children }) => (
    <h2
      style={{
        fontSize: 11 * sizeScale,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: accent,
        margin: `0 0 ${8 * sizeScale}px 0`,
        paddingBottom: 5,
        borderBottom: `1.5px solid ${accent}30`,
        fontFamily,
      }}
    >
      {children}
    </h2>
  );

  /* Sidebar section heading */
  const SideTitle = ({ children }) => (
    <h2
      style={{
        fontSize: 10 * sizeScale,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: accent,
        margin: `0 0 ${7 * sizeScale}px 0`,
        paddingBottom: 4,
        borderBottom: `1.5px solid ${accent}25`,
        fontFamily,
      }}
    >
      {children}
    </h2>
  );

  // Determine content density for spacing
  const totalMainItems = experience.length + education.length + projects.length;
  const isVeryDense = totalMainItems >= 6;
  const mainGap = isVeryDense ? 12 * sizeScale : 16 * sizeScale;
  const sideGap = (normalizedSkills.length + certifications.length + languages.length > 6) ? 14 : 18;

  return (
    <div
      className="resume-template resume-template-compact"
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        fontFamily,
        fontSize: `${10 * sizeScale}px`,
        lineHeight: 1.45,
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: "28px 32px 18px", borderBottom: `2.5px solid ${accent}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                fontSize: 24 * sizeScale,
                fontWeight: 900,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.01em",
                fontFamily,
              }}
            >
              {personalInfo.fullName || "Your Name"}
            </h1>
          </div>
          <div style={{ textAlign: "right", fontSize: 9.5 * sizeScale, color: "#6b7280", fontFamily, lineHeight: 1.6 }}>
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
          </div>
        </div>
        {(personalInfo.linkedin || personalInfo.portfolio) && (
          <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
            {personalInfo.linkedin && <a href={personalInfo.linkedin} style={{ fontSize: 9 * sizeScale, color: accent, fontFamily, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {personalInfo.portfolio && <a href={personalInfo.portfolio} style={{ fontSize: 9 * sizeScale, color: accent, fontFamily, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">Portfolio</a>}
          </div>
        )}
      </div>

      {/* ── Two-Column Body ── */}
      <div style={{ display: "flex", padding: "18px 32px 28px" }}>
        {/* Left: Main Content (65%) */}
        <div style={{ flex: "0 0 63%", paddingRight: 22, display: "flex", flexDirection: "column", gap: mainGap }}>
          {/* Summary */}
          {summary && (
            <div>
              <SectionTitle>Summary</SectionTitle>
              <p style={{ fontSize: 10 * sizeScale, lineHeight: 1.6, color: "#374151", margin: 0, fontFamily }}>{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <SectionTitle>Experience</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 * sizeScale }}>
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 11.5 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{exp.title || "Position"}</h3>
                      <span style={{ fontSize: 9 * sizeScale, color: "#9ca3af", fontFamily, fontWeight: 500, fontStyle: "italic" }}>{[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}</span>
                    </div>
                    {exp.company && (
                      <p style={{ fontSize: 10 * sizeScale, color: "#6b7280", fontStyle: "italic", margin: "1px 0 0", fontFamily, fontWeight: 500 }}>
                        {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                      </p>
                    )}
                    {exp.bullets?.length > 0 && (
                      <ul style={{ margin: "4px 0 0", paddingLeft: 14, listStyleType: "disc" }}>
                        {exp.bullets.map((b, j) => b.trim() ? (
                          <li key={j} style={{ fontSize: 9.5 * sizeScale, lineHeight: 1.55, color: "#374151", marginBottom: 1, fontFamily }}>{b}</li>
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
              <div style={{ display: "flex", flexDirection: "column", gap: 8 * sizeScale }}>
                {education.map((edu, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 11 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{edu.degree || "Degree"}</h3>
                      <span style={{ fontSize: 9 * sizeScale, color: "#9ca3af", fontFamily, fontStyle: "italic" }}>{edu.year || ""}</span>
                    </div>
                    <p style={{ fontSize: 10 * sizeScale, color: "#6b7280", margin: "1px 0 0", fontFamily }}>
                      {edu.institution || ""}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 10 * sizeScale }}>
                {projects.map((proj, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: 11 * sizeScale, fontWeight: 700, color: "#111827", margin: 0, fontFamily }}>{proj.name || "Project"}</h3>
                      {proj.techStack && <span style={{ fontSize: 8.5 * sizeScale, color: accent, fontFamily, fontWeight: 600 }}>({proj.techStack})</span>}
                    </div>
                    {proj.description && <p style={{ fontSize: 9.5 * sizeScale, color: "#374151", margin: "2px 0 0", lineHeight: 1.55, fontFamily }}>{proj.description}</p>}
                    {proj.link && <a href={proj.link} style={{ fontSize: 8.5 * sizeScale, color: accent, fontFamily, textDecoration: "none", borderBottom: `1px solid ${accent}44` }} target="_blank" rel="noopener noreferrer">{proj.link}</a>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar (35%) */}
        <div
          style={{
            flex: "0 0 37%",
            paddingLeft: 20,
            borderLeft: `1.5px solid #e5e7eb`,
            display: "flex",
            flexDirection: "column",
            gap: sideGap,
          }}
        >
          {/* Skills */}
          {normalizedSkills.length > 0 && (
            <div>
              <SideTitle>Technical Skills</SideTitle>
              <p style={{ fontSize: 9.5 * sizeScale, color: "#374151", lineHeight: 1.7, fontFamily, margin: 0 }}>
                {normalizedSkills.join(", ")}
              </p>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <SideTitle>Certifications</SideTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {certifications.map((cert, i) => (
                  <div key={i}>
                    <span style={{ fontSize: 9.5 * sizeScale, fontWeight: 600, color: "#111827", fontFamily, display: "block", lineHeight: 1.35 }}>{cert.name}</span>
                    {(cert.issuer || cert.year) && (
                      <span style={{ fontSize: 8.5 * sizeScale, color: "#9ca3af", fontFamily }}>
                        {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div>
              <SideTitle>Languages</SideTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {languages.map((l, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9.5 * sizeScale, color: "#374151", fontFamily, fontWeight: 500 }}>{l.language}</span>
                    {l.proficiency && <span style={{ fontSize: 8.5 * sizeScale, color: "#9ca3af", fontFamily }}>{l.proficiency}</span>}
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

export default CompactTemplate;
