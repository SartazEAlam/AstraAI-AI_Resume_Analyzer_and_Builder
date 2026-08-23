import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

/**
 * Multi-Template ATS PDF Generator with Typographic Auto-Fitter
 *
 * Guarantees 100% extractable text by writing real PDF strings.
 * Maps the 3 master PDF archetypes:
 *   1. Centered (Classic)
 *   2. Left-Aligned (Minimal)
 *   3. Sidebar (Modern)
 *
 * Employs a Typographic Auto-Fitter loop to dynamically scale
 * font sizes, line heights, and gaps until content perfectly fits one A4 page,
 * keeping margins strictly fixed for optimal aesthetics.
 */

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

// ── Fixed Page Margins (Never scale these) ──
const MARGIN_X = 45;
const MARGIN_TOP = 46;
const MARGIN_BOTTOM = 50;
const CONTENT_W = PAGE_WIDTH - MARGIN_X * 2;

// ── Color helpers ──
function hexToRgb(hex) {
  const h = (hex || "#4f46e5").replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// ── Sanitization (Strip hidden control chars, keep ATS safe) ──
function sanitize(text) {
  if (!text) return "";
  return text
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'") // Smart single quotes
    .replace(/[\u201C\u201D]/g, '"')             // Smart double quotes
    .replace(/\u2013/g, "-")                     // En dash
    .replace(/\u2014/g, "--")                    // Em dash
    .replace(/\u2026/g, "...")                   // Ellipsis
    .replace(/\u2022/g, "-")                     // Bullet -> Dash
    .replace(/[\u00A0\t\r\n]/g, " ")             // Replace tabs, newlines, NBSP with space
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")       // Strip all other control characters (fixes WinAnsi error)
    .replace(/\s+/g, " ")                        // Collapse multiple spaces
    .trim();
}

// ── Text wrapping (Respects exact width boundaries) ──
function wrapText(text, maxWidth, font, fontSize) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.filter((s) => typeof s === "string" && s.trim());
  }
  if (typeof skills === "string") {
    return skills
      .split(/[,;\n•·|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

const FONT_MAP = {
  inter: {
    regular: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrj72A.ttf",
    bold: "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrj72A.ttf",
    italic: "https://fonts.gstatic.com/s/inter/v20/UcCM3FwrK3iLTcvneQg7Ca725JhhKnNqk4j1ebLhAm8SrXTc2dthjZ-Ck-8.ttf"
  },
  outfit: {
    regular: "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4G-FCAp.ttf",
    bold: "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4deyC4G-FCAp.ttf",
    italic: "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4G-FCAp.ttf"
  },
  "roboto mono": {
    regular: "https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf",
    bold: "https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_7Pq_ROW4.ttf",
    italic: "https://fonts.gstatic.com/s/robotomono/v23/L0xoDF4xlVMF-BfR8bXMIjhOsXG-qQCZyFC-FKK8S54.ttf"
  },
  merriweather: {
    regular: "https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5-fCZM.ttf",
    bold: "https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZWMf6.ttf",
    italic: "https://fonts.gstatic.com/s/merriweather/v30/u-4m0qyriQwlOrhSvowK_l5-eRZOf-I.ttf"
  }
};

async function loadFontFamily(pdfDoc, customFont) {
  const fontStr = (customFont || "").toLowerCase();
  let baseReg = StandardFonts.Helvetica;
  let baseBld = StandardFonts.HelveticaBold;
  let baseItl = StandardFonts.HelveticaOblique;

  if (fontStr.includes("roboto mono") || fontStr.includes("mono") || fontStr.includes("consolas")) {
    baseReg = StandardFonts.Courier;
    baseBld = StandardFonts.CourierBold;
    baseItl = StandardFonts.CourierOblique;
  } else if (fontStr.includes("georgia") || fontStr.includes("times") || fontStr.includes("merriweather") || fontStr.includes("serif")) {
    baseReg = StandardFonts.TimesRoman;
    baseBld = StandardFonts.TimesRomanBold;
    baseItl = StandardFonts.TimesRomanItalic;
  }

  let fontKey = null;
  if (fontStr.includes("outfit")) fontKey = "outfit";
  else if (fontStr.includes("inter")) fontKey = "inter";
  else if (fontStr.includes("roboto mono") || fontStr.includes("mono")) fontKey = "roboto mono";
  else if (fontStr.includes("merriweather")) fontKey = "merriweather";

  if (fontKey && FONT_MAP[fontKey]) {
    try {
      const [regBytes, bldBytes, itlBytes] = await Promise.all([
        fetch(FONT_MAP[fontKey].regular).then((r) => { if (!r.ok) throw new Error(); return r.arrayBuffer(); }),
        fetch(FONT_MAP[fontKey].bold).then((r) => { if (!r.ok) throw new Error(); return r.arrayBuffer(); }),
        fetch(FONT_MAP[fontKey].italic).then((r) => { if (!r.ok) throw new Error(); return r.arrayBuffer(); })
      ]);
      return {
        fontRegular: await pdfDoc.embedFont(regBytes),
        fontBold: await pdfDoc.embedFont(bldBytes),
        fontItalic: await pdfDoc.embedFont(itlBytes)
      };
    } catch {
      // Fallback cleanly to standard fonts
    }
  }

  return {
    fontRegular: await pdfDoc.embedFont(baseReg),
    fontBold: await pdfDoc.embedFont(baseBld),
    fontItalic: await pdfDoc.embedFont(baseItl)
  };
}

export async function generateResumePDF(data, customization = {}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const templateId = customization?.templateId || customization?.template || "classic";
  const accentHex = customization?.accentColor || "#4f46e5";
  const customFont = customization?.fontFamily || "";

  const { fontRegular, fontBold, fontItalic } = await loadFontFamily(pdfDoc, customFont);

  // Distinct font size multipliers: Small: 0.85x, Default: 1.05x, Large: 1.28x
  const fontSizeSetting = customization?.fontSize || "default";
  const userBaseFMult = fontSizeSetting === "small" ? 0.85 : fontSizeSetting === "large" ? 1.28 : 1.05;

  // Premium Color Palette
  const accentColor = hexToRgb(accentHex);
  const darkCharcoal = rgb(0.11, 0.14, 0.19);
  const mediumColor = rgb(0.3, 0.35, 0.4);
  const grayColor = rgb(0.45, 0.5, 0.55);
  const lightGray = rgb(0.85, 0.88, 0.9);
  const whiteColor = rgb(1, 1, 1);
  const translucentWhite = rgb(0.92, 0.94, 0.96);
  const veryLightGray = rgb(0.92, 0.94, 0.95);

  let currentMultiplier = userBaseFMult;

  // Layout Engine
  const buildLayout = (page, fMult) => {
    const s = (val) => val * fMult;
    
    let isModern = templateId === "modern";
    let isClassic = templateId === "classic";
    let isMinimal = templateId === "minimal";
    if (!isModern && !isClassic && !isMinimal) isClassic = true;

    let y = PAGE_HEIGHT - MARGIN_TOP;

    // Fixed widths
    const sideW = isModern ? 195 : 0; // Sidebar width
    const mainX = isModern ? sideW + 22 : MARGIN_X;
    const mainW = isModern ? PAGE_WIDTH - mainX - 22 : CONTENT_W;

    // ── Core Drawing Helpers ──
    const drawT = (text, { x, yPos, size, font, color, maxW, align = "left", skipSanitize = false }) => {
      if (!text || !page) return;
      const safe = skipSanitize ? text : sanitize(text);
      if (!safe) return;
      
      let display = safe;
      let actualW = font.widthOfTextAtSize(display, size);
      
      if (maxW && actualW > maxW) {
        while (font.widthOfTextAtSize(display, size) > maxW && display.length > 1) {
          display = display.slice(0, -1);
        }
        actualW = font.widthOfTextAtSize(display, size);
      }

      let drawX = x;
      if (align === "center") drawX = x - actualW / 2;
      else if (align === "right") drawX = x - actualW;

      page.drawText(display, { x: drawX, y: yPos, size, font, color });
      return actualW;
    };

    const drawLine = (x1, y1, x2, thickness, color) => {
      if (!page) return;
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness, color });
    };

    const drawRect = (x, rY, w, h, color) => {
      if (!page) return;
      page.drawRectangle({ x, y: rY, width: w, height: h, color });
    };

    const drawWrapped = (text, { x, yPos, w, font: f, size: sz, color: c, lineHeight = 1.45 }) => {
      const lines = wrapText(sanitize(text), w, f, sz);
      let cy = yPos;
      for (const line of lines) {
        drawT(line, { x, yPos: cy, size: sz, font: f, color: c });
        cy -= sz * lineHeight;
      }
      return lines.length * (sz * lineHeight);
    };

    const pi = data?.personalInfo || {};
    const summary = data?.summary?.trim();
    const experiences = (data?.experience || []).filter((e) => e.title || e.company);
    const educations = (data?.education || []).filter((e) => e.degree || e.institution);
    const projects = (data?.projects || []).filter((p) => p.name);
    const skills = normalizeSkills(data?.skills);
    const certs = (data?.certifications || []).filter((c) => c.name);
    const langs = (data?.languages || []).filter((l) => l.language);

    if (isModern && page) {
      drawRect(0, 0, sideW, PAGE_HEIGHT, accentColor);
    }

    var sidebarY = PAGE_HEIGHT - MARGIN_TOP;

    if (isModern) {
      // Avatar
      const rad = s(34);
      if (page && pi.fullName) {
        const parts = pi.fullName.split(" ");
        let initials = (parts[0]?.[0] || "U").toUpperCase();
        if (parts.length > 1) initials += (parts[parts.length - 1]?.[0] || "").toUpperCase();
        
        const cx = sideW / 2;
        const cy = y - rad;
        page.drawCircle({ x: cx, y: cy, size: rad, color: whiteColor, opacity: 0.18 });
        const initW = fontBold.widthOfTextAtSize(initials, s(24));
        drawT(initials, { x: cx - initW/2, yPos: cy - s(8), size: s(24), font: fontBold, color: whiteColor });
      }
      y -= rad * 2 + s(28); 

      // Name
      if (pi.fullName) {
        drawT(pi.fullName, { x: sideW/2, yPos: y, size: s(16), font: fontBold, color: whiteColor, align: "center", maxW: sideW - 24 });
        y -= s(22);
      }
      
      drawLine(20, y, sideW - 20, 1, whiteColor);
      y -= s(20);

      sidebarY = y;
      
      // Contact Section
      drawT("CONTACT", { x: 18, yPos: sidebarY, size: s(9.5), font: fontBold, color: translucentWhite });
      sidebarY -= s(14);

      const contactArr = [
        pi.email,
        pi.phone,
        pi.location,
        pi.linkedin,
        pi.portfolio
      ].filter(Boolean);

      for (const val of contactArr) {
        drawT(val, { x: 18, yPos: sidebarY, size: s(9), font: fontRegular, color: whiteColor, maxW: sideW - 32 });
        sidebarY -= s(16);
      }
      sidebarY -= s(10);
      
      y = PAGE_HEIGHT - MARGIN_TOP - s(10);
    } 
    else if (isClassic) {
      if (pi.fullName) {
        drawT(pi.fullName, { x: PAGE_WIDTH / 2, yPos: y, size: s(24), font: fontBold, color: darkCharcoal, align: "center" });
        y -= s(24) + s(10);
      }
      
      const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join("    |    ");
      if (contactLine) {
        drawT(contactLine, { x: PAGE_WIDTH / 2, yPos: y, size: s(9.5), font: fontRegular, color: mediumColor, align: "center" });
        y -= s(9.5) + s(6);
      }

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join("    |    ");
      if (linkLine) {
        drawT(linkLine, { x: PAGE_WIDTH / 2, yPos: y, size: s(9.5), font: fontRegular, color: accentColor, align: "center" });
        y -= s(9.5) + s(10);
      }

      drawLine(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, 2.5, accentColor);
      y -= s(20);
    } 
    else if (isMinimal) {
      if (pi.fullName) {
        drawT(pi.fullName, { x: MARGIN_X, yPos: y, size: s(26), font: fontBold, color: darkCharcoal });
        y -= s(26) + s(10);
      }
      
      const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join("   ·   ");
      if (contactLine) {
        drawT(contactLine, { x: MARGIN_X, yPos: y, size: s(9.5), font: fontRegular, color: grayColor });
        y -= s(9.5) + s(6);
      }

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join("   ·   ");
      if (linkLine) {
        drawT(linkLine, { x: MARGIN_X, yPos: y, size: s(9), font: fontRegular, color: accentColor });
        y -= s(9) + s(8);
      }

      drawLine(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, 1, lightGray);
      y -= s(18);
    }

    // ── Helper to draw elegant section headers ──
    const drawSectionTitle = (title, cursorY, xPos, width, inSidebar = false) => {
      let currentY = cursorY;
      
      if (isModern) {
        if (inSidebar) {
          drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(9.5), font: fontBold, color: translucentWhite, skipSanitize: true });
          currentY -= s(8);
          drawLine(xPos, currentY, xPos + width, 0.75, whiteColor);
        } else {
          drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(11), font: fontBold, color: accentColor });
          currentY -= s(8);
          drawLine(xPos, currentY, xPos + width, 1.5, veryLightGray);
        }
      } 
      else if (isClassic) {
        const titleH = s(12);
        if (page) page.drawRectangle({ x: xPos, y: currentY - s(2), width: 3.5, height: titleH + s(2), color: accentColor });
        drawT(title.toUpperCase(), { x: xPos + 10, yPos: currentY, size: s(12), font: fontBold, color: accentColor });
        currentY -= s(8);
        drawLine(xPos, currentY, xPos + width, 1, veryLightGray);
      } 
      else if (isMinimal) {
        drawLine(xPos, currentY + s(12), xPos + width, 0.75, lightGray);
        drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(10), font: fontBold, color: grayColor });
        currentY -= s(8);
      }
      
      return currentY - s(12);
    };

    // ════════════════════════════════════════════
    // MAIN CONTENT SECTIONS (Synchronized Order)
    // ════════════════════════════════════════════

    // 1. SUMMARY
    if (summary) {
      y = drawSectionTitle("Professional Summary", y, mainX, mainW);
      const consumed = drawWrapped(summary, {
        x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(10), color: darkCharcoal, lineHeight: 1.5
      });
      y -= consumed + s(16);
    }

    // 2. EXPERIENCE
    if (experiences.length > 0) {
      y = drawSectionTitle("Work Experience", y, mainX, mainW);
      
      for (let i = 0; i < experiences.length; i++) {
        const exp = experiences[i];
        
        const role = exp.title || "Role";
        const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" - ");
        const datesW = dates ? fontRegular.widthOfTextAtSize(sanitize(dates), s(9.5)) : 0;
        
        if (datesW > 0) {
            drawT(dates, { x: mainX + mainW, yPos: y, size: s(9.5), font: fontRegular, color: grayColor, align: "right" });
        }
        
        const roleW = mainW - datesW - 10;
        const consumedRole = drawWrapped(role, { x: mainX, yPos: y, w: roleW, font: fontBold, size: s(11), color: darkCharcoal, lineHeight: 1.25 });
        y -= consumedRole + s(2);

        const compLoc = [exp.company, exp.location].filter(Boolean).join("  ·  ");
        if (compLoc) {
          const consumedComp = drawWrapped(compLoc, { x: mainX, yPos: y, w: mainW, font: fontItalic, size: s(10), color: isClassic ? grayColor : accentColor, lineHeight: 1.25 });
          y -= consumedComp + s(4);
        } else {
          y -= s(4);
        }

        const bullets = (exp.bullets || []).filter((b) => b && typeof b === "string" && b.trim());
        for (const bullet of bullets) {
          // Precise bullet point circle (radius 1.8pt, clean alignment)
          if (page) page.drawCircle({ x: mainX + 4, y: y + s(3.5), size: s(1.8), color: isClassic ? accentColor : grayColor });
          const consumed = drawWrapped(bullet.trim(), {
            x: mainX + 12, yPos: y, w: mainW - 14, font: fontRegular, size: s(10), color: darkCharcoal, lineHeight: 1.5
          });
          y -= consumed + s(3);
        }
        
        y -= s(10);
      }
      y -= s(4);
    }

    // 3. EDUCATION
    if (educations.length > 0) {
      y = drawSectionTitle("Education", y, mainX, mainW);
      for (const edu of educations) {
        const deg = edu.degree || "Degree";
        const dates = edu.year || "";
        const datesW = dates ? fontRegular.widthOfTextAtSize(sanitize(dates), s(9.5)) : 0;
        
        if (datesW > 0) {
            drawT(dates, { x: mainX + mainW, yPos: y, size: s(9.5), font: fontRegular, color: grayColor, align: "right" });
        }
        
        const degW = mainW - datesW - 10;
        const consumedDeg = drawWrapped(deg, { x: mainX, yPos: y, w: degW, font: fontBold, size: s(11), color: darkCharcoal, lineHeight: 1.25 });
        y -= consumedDeg + s(2);

        const instLine = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : ""].filter(Boolean).join("  ·  ");
        if (instLine) {
          const consumedInst = drawWrapped(instLine, { x: mainX, yPos: y, w: mainW, font: fontItalic, size: s(10), color: darkCharcoal, lineHeight: 1.25 });
          y -= consumedInst + s(4);
        } else {
          y -= s(4);
        }
        
        y -= s(6);
      }
      y -= s(4);
    }

    // 4. SKILLS (Rendered before projects for single-column templates to match screen)
    let sY = isModern ? sidebarY : y;
    let sX = isModern ? 18 : mainX;
    const sW = isModern ? sideW - 36 : mainW;

    if (skills.length > 0) {
      if (isModern) {
        sY = drawSectionTitle("Skills", sY, sX, sW, true);
        
        // Render pill tags in modern sidebar
        const tagFontSize = s(8.5);
        const tagPadX = 7;
        const tagPadY = s(3.5);
        const tagGapX = 5;
        const tagGapY = s(6);
        const tagH = tagFontSize + tagPadY * 2;
        let tagX = sX;
        let tagRowY = sY;

        for (const skill of skills) {
          const textW = fontBold.widthOfTextAtSize(sanitize(skill), tagFontSize);
          const totalW = textW + tagPadX * 2;
          
          if (tagX + totalW > sX + sW) {
            tagX = sX;
            tagRowY -= tagH + tagGapY;
          }

          if (page) page.drawRectangle({ x: tagX, y: tagRowY - tagH, width: totalW, height: tagH, color: whiteColor, opacity: 0.15, borderColor: whiteColor, borderWidth: 0.5, borderOpacity: 0.3 });
          drawT(skill, { x: tagX + tagPadX, yPos: tagRowY - tagFontSize - tagPadY + s(2), size: tagFontSize, font: fontBold, color: whiteColor });
          
          tagX += totalW + tagGapX;
        }
        sY = tagRowY - tagH - s(14);

      } else if (isClassic) {
        y = drawSectionTitle("Technical Skills", y, sX, sW);
        const tagFontSize = s(9.5);
        const tagPadX = 9;
        const tagPadY = s(3.5);
        const tagGapX = 6;
        const tagGapY = s(6);
        const tagH = tagFontSize + tagPadY * 2;
        let tagX = sX;
        let tagRowY = y;

        for (const skill of skills) {
          const textW = fontBold.widthOfTextAtSize(sanitize(skill), tagFontSize);
          const totalW = textW + tagPadX * 2;
          if (tagX + totalW > sX + sW) {
            tagX = sX;
            tagRowY -= tagH + tagGapY;
          }
          if (page) page.drawRectangle({ x: tagX, y: tagRowY - tagH, width: totalW, height: tagH, color: accentColor, opacity: 0.08, borderColor: accentColor, borderWidth: 0.5, borderOpacity: 0.25 });
          drawT(skill, { x: tagX + tagPadX, yPos: tagRowY - tagFontSize - tagPadY + s(2), size: tagFontSize, font: fontBold, color: darkCharcoal });
          tagX += totalW + tagGapX;
        }
        y = tagRowY - tagH - s(14);
      } else {
        y = drawSectionTitle("Technical Skills", y, sX, sW);
        const skillText = skills.join("    ·    ");
        const consumed = drawWrapped(skillText, { x: sX, yPos: y, w: sW, font: fontRegular, size: s(10), color: darkCharcoal, lineHeight: 1.5 });
        y -= consumed + s(14);
      }
    }

    // 5. PROJECTS
    if (projects.length > 0) {
      y = drawSectionTitle("Projects", y, mainX, mainW);
      for (const proj of projects) {
        const pName = proj.name;
        const pTech = proj.techStack ? `(${proj.techStack})` : "";
        
        const consumedName = drawWrapped(pName, { x: mainX, yPos: y, w: mainW, font: fontBold, size: s(11), color: darkCharcoal, lineHeight: 1.25 });
        y -= consumedName + s(2);
        
        if (pTech) {
          const consumedTech = drawWrapped(pTech, { x: mainX, yPos: y, w: mainW, font: fontBold, size: s(9), color: accentColor, lineHeight: 1.25 });
          y -= consumedTech + s(4);
        } else {
          y -= s(4);
        }

        if (proj.description) {
          const consumedDesc = drawWrapped(proj.description.trim(), {
            x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(10), color: darkCharcoal, lineHeight: 1.5
          });
          y -= consumedDesc + s(4);
        }

        if (proj.link) {
          drawT(proj.link.trim(), { x: mainX, yPos: y, size: s(9), font: fontRegular, color: accentColor });
          y -= s(10);
        }
        y -= s(6);
      }
      y -= s(4);
    }

    // 6. CERTIFICATIONS
    if (certs.length > 0) {
      if (isModern) {
        sY = drawSectionTitle("Certifications", sY, sX, sW, true);
        for (const cert of certs) {
          drawT(cert.name, { x: sX, yPos: sY, size: s(9.5), font: fontBold, color: whiteColor, maxW: sW });
          sY -= s(11);
          if (cert.issuer) {
            drawT(cert.issuer, { x: sX, yPos: sY, size: s(8.5), font: fontRegular, color: translucentWhite, maxW: sW });
            sY -= s(11);
          }
          if (cert.year) {
            drawT(cert.year, { x: sX, yPos: sY, size: s(8.5), font: fontRegular, color: translucentWhite });
            sY -= s(11);
          }
          sY -= s(3);
        }
        sY -= s(8);
      } else {
        y = drawSectionTitle("Certifications", y, sX, sW);
        for (const cert of certs) {
          const certLeft = `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}`;
          const certRight = cert.year ? `${cert.year}` : "";
          drawT(certLeft, { x: sX, yPos: y, size: s(10), font: fontBold, color: darkCharcoal });
          if (certRight) drawT(certRight, { x: sX + sW, yPos: y, size: s(9), font: fontItalic, color: grayColor, align: "right" });
          y -= s(14);
        }
        y -= s(4);
      }
    }

    // 7. LANGUAGES
    if (langs.length > 0) {
      if (isModern) {
        sY = drawSectionTitle("Languages", sY, sX, sW, true);
        for (const lang of langs) {
          drawT(lang.language, { x: sX, yPos: sY, size: s(9.5), font: fontBold, color: whiteColor });
          sY -= s(11);
          if (lang.proficiency) {
            drawT(lang.proficiency, { x: sX, yPos: sY, size: s(8.5), font: fontRegular, color: translucentWhite });
            sY -= s(11);
          }
          sY -= s(3);
        }
      } else {
        y = drawSectionTitle("Languages", y, sX, sW);
        const langText = langs.map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("    ·    ");
        const consumed = drawWrapped(langText, { x: sX, yPos: y, w: sW, font: fontRegular, size: s(10), color: darkCharcoal });
        y -= consumed + s(14);
      }
    }

    const lowestY = isModern ? Math.min(y, sY) : y;
    return PAGE_HEIGHT - lowestY + MARGIN_BOTTOM;
  };
  
  // Pass 1: Baseline measurement
  let height = buildLayout(null, currentMultiplier);

  // Determine Auto-Fitter bounds based on user's manual font size choice
  let maxAllowedMultiplier = 1.45;
  if (fontSizeSetting === "small") maxAllowedMultiplier = 0.90; // Prevent stretching if user explicitly wants small text
  else if (fontSizeSetting === "large") maxAllowedMultiplier = 1.65; // Allow extra stretching if user wants large text

  // Shrink Loop: If content overflows page, shrink fonts incrementally
  while (height > PAGE_HEIGHT && currentMultiplier > 0.45) {
    currentMultiplier -= 0.025;
    height = buildLayout(null, currentMultiplier);
  }

  // Determine target height for Grow Loop based on font size setting
  let targetGrowHeight = PAGE_HEIGHT * 0.92; 
  if (fontSizeSetting === "small") targetGrowHeight = 0; // Disable grow loop for small (stays compact)
  else if (fontSizeSetting === "large") targetGrowHeight = PAGE_HEIGHT * 0.98; // Aggressively fill page for large

  // Grow Loop: If content is too short (leaves too much whitespace), grow fonts incrementally
  if (height < targetGrowHeight) {
    while (height < targetGrowHeight && currentMultiplier < maxAllowedMultiplier) {
      currentMultiplier += 0.025;
      height = buildLayout(null, currentMultiplier);
    }
  }

  // Final Render Pass
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  buildLayout(page, currentMultiplier);

  return await pdfDoc.save();
}

/**
 * Generates an A4 PDF for Cover Letter based on the selected template and fonts.
 */
export async function generateCoverLetterPDF(data, custom = {}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const customFont = custom?.fontFamily || "";
  const { fontRegular, fontBold } = await loadFontFamily(pdfDoc, customFont);

  const accentClr = hexToRgb(custom?.accentColor || "#4f46e5");
  const textClr = rgb(0.12, 0.16, 0.22); // Dark slate charcoal
  const mutedClr = rgb(0.45, 0.5, 0.55);

  const templateId = custom?.templateId || "classic";
  const { name, email, phone, targetRole, targetCompany, companyAddress, hiringManager, letterContent, letterAlignment } = data || {};

  const baseSize = custom?.fontSize === 'small' ? 9.5 : custom?.fontSize === 'large' ? 13 : 11;
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN_TOP;

  const drawT = (text, x, yPos, size, font, color) => {
    if (!text) return;
    const safe = sanitize(text);
    if (!safe) return;
    page.drawText(safe, { x, y: yPos, size, font, color });
  };

  const drawWrapped = (text, startX, yPos, w, font, size, color, align = 'left') => {
    const lines = wrapText(sanitize(text), w, font, size);
    let cy = yPos;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (align === 'center') {
        const lw = font.widthOfTextAtSize(line, size);
        drawT(line, startX + (w - lw) / 2, cy, size, font, color);
      } else if (align === 'justify' && i < lines.length - 1) {
        const wordsInLine = line.split(' ');
        if (wordsInLine.length > 1) {
          const totalWordsWidth = wordsInLine.reduce((sum, wd) => sum + font.widthOfTextAtSize(wd, size), 0);
          const spaceWidth = (w - totalWordsWidth) / (wordsInLine.length - 1);
          let cx = startX;
          for (const wd of wordsInLine) {
            drawT(wd, cx, cy, size, font, color);
            cx += font.widthOfTextAtSize(wd, size) + spaceWidth;
          }
        } else {
          drawT(line, startX, cy, size, font, color);
        }
      } else {
        drawT(line, startX, cy, size, font, color);
      }
      cy -= size * 1.55;
    }
    return cy;
  };

  if (templateId === "modern") {
    const sideW = 195;
    page.drawRectangle({ x: 0, y: 0, width: sideW, height: PAGE_HEIGHT, color: accentClr });
    
    let sy = PAGE_HEIGHT - 60;
    // Initial avatar with accurate centering
    const init = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'C';
    page.drawCircle({ x: sideW / 2, y: sy - 30, size: 36, color: rgb(1,1,1), opacity: 0.18 });
    const initW = fontBold.widthOfTextAtSize(init, 24);
    page.drawText(init, { x: sideW/2 - initW/2, y: sy - 38, size: 24, font: fontBold, color: rgb(1,1,1) });
    sy -= 85;
    
    drawT(name || "Your Name", 22, sy, 18, fontBold, rgb(1,1,1));
    sy -= 10;
    page.drawLine({ start: { x: 22, y: sy }, end: { x: 55, y: sy }, thickness: 2, color: rgb(1,1,1), opacity: 0.4 });
    sy -= 24;
    
    if (email) { drawT(email, 22, sy, 9.5, fontRegular, rgb(1,1,1)); sy -= 18; }
    if (phone) { drawT(phone, 22, sy, 9.5, fontRegular, rgb(1,1,1)); sy -= 18; }
    
    // Main Content
    let cy = PAGE_HEIGHT - 60;
    const mx = sideW + 36;
    const mw = PAGE_WIDTH - mx - 36;
    
    if (data.date) {
      try {
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        drawT(formattedDate, mx, cy, baseSize, fontBold, textClr);
        cy -= (baseSize * 2.2);
      } catch {
        drawT(data.date, mx, cy, baseSize, fontBold, textClr);
        cy -= (baseSize * 2.2);
      }
    }
    
    if (hiringManager) { drawT(hiringManager, mx, cy, baseSize, fontBold, textClr); cy -= (baseSize * 1.4); }
    if (targetRole) { drawT(targetRole, mx, cy, baseSize, fontBold, textClr); cy -= (baseSize * 1.4); }
    if (targetCompany) { drawT(targetCompany, mx, cy, baseSize, fontBold, textClr); cy -= (baseSize * 1.4); }
    if (companyAddress) { drawT(companyAddress, mx, cy, baseSize, fontRegular, mutedClr); cy -= (baseSize * 1.4); }
    cy -= 12;
    
    const paras = (letterContent || "").split(/\n+/);
    for (const para of paras) {
      if (para.trim()) {
        cy = drawWrapped(para.trim(), mx, cy, mw, fontRegular, baseSize, textClr, letterAlignment || 'left');
        cy -= (baseSize * 0.8);
      }
    }

  } else {
    // Classic & Minimal
    if (templateId === "classic") {
      const nameW = fontBold.widthOfTextAtSize(name || "Your Name", 24);
      drawT(name || "Your Name", (PAGE_WIDTH - nameW)/2, y, 24, fontBold, textClr);
      y -= 18;
      const contactStr = [email, phone].filter(Boolean).join("    |    ");
      if (contactStr) {
        const cw = fontRegular.widthOfTextAtSize(contactStr, 10);
        drawT(contactStr, (PAGE_WIDTH - cw)/2, y, 10, fontRegular, mutedClr);
        y -= 12;
      }
      page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 2, color: accentClr });
      y -= 26;
    } else {
      drawT(name || "Your Name", MARGIN_X, y, 26, fontBold, accentClr);
      y -= 18;
      const contactStr = [email, phone].filter(Boolean).join("   ·   ");
      if (contactStr) {
        drawT(contactStr, MARGIN_X, y, 10, fontRegular, mutedClr);
        y -= 12;
      }
      page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 1, color: rgb(0.85, 0.88, 0.9) });
      y -= 24;
    }

    if (data.date) {
      try {
        const formattedDate = new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        drawT(formattedDate, MARGIN_X, y, baseSize, fontBold, textClr);
        y -= (baseSize * 2.2);
      } catch {
        drawT(data.date, MARGIN_X, y, baseSize, fontBold, textClr);
        y -= (baseSize * 2.2);
      }
    }
    
    if (hiringManager) { drawT(hiringManager, MARGIN_X, y, baseSize, fontBold, textClr); y -= (baseSize * 1.4); }
    if (targetRole) { drawT(targetRole, MARGIN_X, y, baseSize, fontBold, textClr); y -= (baseSize * 1.4); }
    if (targetCompany) { drawT(targetCompany, MARGIN_X, y, baseSize, fontBold, textClr); y -= (baseSize * 1.4); }
    if (companyAddress) { drawT(companyAddress, MARGIN_X, y, baseSize, fontRegular, mutedClr); y -= (baseSize * 1.4); }
    y -= 12;

    const paras = (letterContent || "").split(/\n+/);
    for (const para of paras) {
      if (para.trim()) {
        y = drawWrapped(para.trim(), MARGIN_X, y, CONTENT_W, fontRegular, baseSize, textClr, letterAlignment || 'left');
        y -= (baseSize * 0.8);
      }
    }
  }

  return await pdfDoc.save();
}
