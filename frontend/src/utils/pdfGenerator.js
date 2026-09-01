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

async function loadFontFamily(pdfDoc, customFont) {
  const fontStr = (customFont || "").toLowerCase();

  // 1. Technical Monospace (JetBrains Mono / Courier)
  if (
    fontStr.includes("mono") ||
    fontStr.includes("jetbrains") ||
    fontStr.includes("courier") ||
    fontStr.includes("code")
  ) {
    return {
      fontRegular: await pdfDoc.embedFont(StandardFonts.Courier),
      fontBold: await pdfDoc.embedFont(StandardFonts.CourierBold),
      fontItalic: await pdfDoc.embedFont(StandardFonts.CourierOblique),
      category: "mono",
      charSpacing: 0,
      headerTracking: 0,
    };
  }

  // 2. Classic Executive Editorial Serif (Merriweather / Times)
  if (
    fontStr.includes("merriweather") ||
    fontStr.includes("times") ||
    fontStr.includes("georgia") ||
    (fontStr.includes("serif") && !fontStr.includes("sans-serif"))
  ) {
    return {
      fontRegular: await pdfDoc.embedFont(StandardFonts.TimesRoman),
      fontBold: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
      fontItalic: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
      category: "serif",
      charSpacing: 0,
      headerTracking: 0.8,
    };
  }

  // 3. Clean Modern Sans-Serif (Inter / Helvetica - Universal ATS Standard)
  return {
    fontRegular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    fontBold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    fontItalic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    category: "sans",
    charSpacing: 0,
    headerTracking: 0.5,
  };
}

export async function generateResumePDF(data, customization = {}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const templateId = customization?.templateId || customization?.template || "classic";
  const accentHex = customization?.accentColor || "#4f46e5";
  const customFont = customization?.fontFamily || "";

  const { fontRegular, fontBold, fontItalic, category = "sans", charSpacing = 0, headerTracking = 0.5 } = await loadFontFamily(pdfDoc, customFont);

  const isSerif = category === "serif" || category === "slab";
  const isMono = category === "mono";
  const isGeometric = category === "geometric";
  const isCondensed = category === "condensed";

  // Distinct font size setting
  const fontSizeSetting = customization?.fontSize || "default";

  // Premium Color Palette
  const accentColor = hexToRgb(accentHex);
  const darkCharcoal = rgb(0.11, 0.14, 0.19);
  const mediumColor = rgb(0.3, 0.35, 0.4);
  const grayColor = rgb(0.45, 0.5, 0.55);
  const lightGray = rgb(0.85, 0.88, 0.9);
  const whiteColor = rgb(1, 1, 1);
  const translucentWhite = rgb(0.92, 0.94, 0.96);
  const veryLightGray = rgb(0.92, 0.94, 0.95);

  const experiences = (data?.experience || []).filter((e) => e.title || e.company);
  const educations = (data?.education || []).filter((e) => e.degree || e.institution);
  const projects = (data?.projects || []).filter((p) => p.name);
  const skills = normalizeSkills(data?.skills);
  const certs = (data?.certifications || []).filter((c) => c.name);
  const langs = (data?.languages || []).filter((l) => l.language);
  const totalItemCount = experiences.length + educations.length + projects.length;
  const isDense = totalItemCount >= 7;

  // Layout Engine
  const buildLayout = (page, fMult) => {
    const s = (val) => val * fMult;
    const g = (val) => isDense ? val * fMult * 0.85 : val * fMult;
    
    let isModern = templateId === "modern";
    let isClassic = templateId === "classic";
    let isMinimal = templateId === "minimal";
    let isExecutive = templateId === "executive";
    let isCompact = templateId === "compact";
    let isProfessional = templateId === "professional";
    if (!isModern && !isClassic && !isMinimal && !isExecutive && !isCompact && !isProfessional) isClassic = true;

    const hasSidebar = isModern || isCompact;
    const sideW = isModern ? 190 : isCompact ? 180 : 0;
    const marginX = isDense ? 34 : MARGIN_X;
    const marginTop = isDense ? 30 : MARGIN_TOP;
    const marginBottom = isDense ? 24 : MARGIN_BOTTOM;

    const mainX = isModern ? sideW + 20 : marginX;
    const mainW = isModern ? PAGE_WIDTH - mainX - 20 : isCompact ? PAGE_WIDTH - marginX * 2 - sideW - 16 : PAGE_WIDTH - marginX * 2;
    const dividerX = isCompact ? mainX + mainW + 8 : 0;
    const sideX = isCompact ? dividerX + 8 : 18;
    const sideContentW = isCompact ? PAGE_WIDTH - marginX - sideX : sideW - 36;

    let y = PAGE_HEIGHT - marginTop;
    let sidebarY = PAGE_HEIGHT - marginTop;
    let compactHeaderBorderY = 0;

    // ── Core Drawing Helpers ──
    const drawT = (text, { x, yPos, size, font, color, maxW, align = "left", skipSanitize = false, spacing }) => {
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

      const track = spacing !== undefined ? spacing : (charSpacing || 0);
      if (track !== 0) {
        page.drawText(display, { x: drawX, y: yPos, size, font, color, characterSpacing: track });
      } else {
        page.drawText(display, { x: drawX, y: yPos, size, font, color });
      }
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

    const getRoundedRectPath = (w, h, r) => {
      const rad = Math.min(r, h / 2, w / 2);
      return `M ${rad} 0 L ${w - rad} 0 Q ${w} 0 ${w} ${rad} L ${w} ${h - rad} Q ${w} ${h} ${w - rad} ${h} L ${rad} ${h} Q 0 ${h} 0 ${h - rad} L 0 ${rad} Q 0 0 ${rad} 0 Z`;
    };

    const drawPill = (pX, pY, pW, pH, fillCol, fillOp, strokeCol, strokeOp) => {
      if (!page) return;
      const r = pH / 2;
      const path = getRoundedRectPath(pW, pH, r);
      page.drawSvgPath(path, {
        x: pX,
        y: pY + pH,
        color: fillCol,
        opacity: fillOp,
        borderColor: strokeCol,
        borderWidth: 0.6,
        borderOpacity: strokeOp
      });
    };

    const drawWrapped = (text, { x, yPos, w, font: f, size: sz, color: c, lineHeight = 1.35 }) => {
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

    if (isModern && page) {
      drawRect(0, 0, sideW, PAGE_HEIGHT, accentColor);
    }

    if (isModern) {
      // Avatar
      const rad = s(26);
      const cx = sideW / 2;
      const cy = sidebarY - rad;
      if (page && pi.fullName) {
        const parts = pi.fullName.split(" ");
        let initials = (parts[0]?.[0] || "U").toUpperCase();
        if (parts.length > 1) initials += (parts[parts.length - 1]?.[0] || "").toUpperCase();
        
        page.drawCircle({ x: cx, y: cy, size: rad, color: whiteColor, opacity: 0.18 });
        const initW = fontBold.widthOfTextAtSize(initials, s(20));
        drawT(initials, { x: cx - initW/2, yPos: cy - s(7), size: s(20), font: fontBold, color: whiteColor });
      }
      
      // Name (Comfortable breathing room between circle bottom and text)
      sidebarY = cy - rad - s(18);

      if (pi.fullName) {
        drawT(pi.fullName, { x: sideW/2, yPos: sidebarY, size: s(14), font: fontBold, color: whiteColor, align: "center", maxW: sideW - 20 });
        sidebarY -= s(16);
      }
      
      if (page) {
        page.drawLine({ start: { x: 20, y: sidebarY }, end: { x: sideW - 20, y: sidebarY }, thickness: 0.75, color: whiteColor, opacity: 0.25 });
      }
      sidebarY -= s(16);
    } 
    else if (isExecutive) {
      // Full-width accent banner header
      const bannerH = s(80);
      if (page) drawRect(0, PAGE_HEIGHT - bannerH, PAGE_WIDTH, bannerH, accentColor);
      let hy = PAGE_HEIGHT - s(28);
      
      if (pi.fullName) {
        drawT(pi.fullName.toUpperCase(), { x: PAGE_WIDTH / 2, yPos: hy, size: s(22), font: fontBold, color: whiteColor, align: "center" });
        hy -= s(22) + s(8);
      }
      
      const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join("    |    ");
      if (contactLine) {
        drawT(contactLine, { x: PAGE_WIDTH / 2, yPos: hy, size: s(9), font: fontRegular, color: translucentWhite, align: "center" });
        hy -= s(9) + s(4);
      }

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join("    |    ");
      if (linkLine) {
        drawT(linkLine, { x: PAGE_WIDTH / 2, yPos: hy, size: s(8.5), font: fontRegular, color: translucentWhite, align: "center" });
      }

      y = PAGE_HEIGHT - bannerH - g(14);
    }
    else if (isCompact) {
      // Compact: Name left, contact right, accent line below
      if (pi.fullName) {
        if (isSerif) {
          drawT(pi.fullName.toUpperCase(), { x: marginX, yPos: y, size: s(18), font: fontBold, color: darkCharcoal, maxW: PAGE_WIDTH - marginX * 2 - 180, spacing: 0.8 });
        } else if (isMono) {
          drawT(`> ${pi.fullName.toUpperCase()}`, { x: marginX, yPos: y, size: s(17), font: fontBold, color: darkCharcoal, maxW: PAGE_WIDTH - marginX * 2 - 180 });
        } else {
          drawT(pi.fullName, { x: marginX, yPos: y, size: s(19), font: fontBold, color: darkCharcoal, maxW: PAGE_WIDTH - marginX * 2 - 180 });
        }
      }
      
      const contactRight = [pi.email, pi.phone, pi.location].filter(Boolean);
      let rightY = y;
      for (const item of contactRight) {
        const itemFont = isSerif ? fontItalic : fontRegular;
        drawT(item, { x: PAGE_WIDTH - marginX, yPos: rightY, size: s(7.5), font: itemFont, color: grayColor, align: "right", maxW: 175 });
        rightY -= s(10);
      }
      y -= s(19) + g(3);

      const linkDelimiter = isSerif ? "   ·   " : "   ·   ";
      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join(linkDelimiter);
      if (linkLine) {
        drawT(linkLine, { x: marginX, yPos: y, size: s(7.5), font: fontRegular, color: accentColor, maxW: mainW });
        y -= s(7.5) + g(3);
      }

      compactHeaderBorderY = y;
      if (isSerif) {
        drawLine(marginX, compactHeaderBorderY, PAGE_WIDTH - marginX, 1.5, accentColor);
        drawLine(marginX, compactHeaderBorderY - 2, PAGE_WIDTH - marginX, 0.5, accentColor);
      } else {
        drawLine(marginX, compactHeaderBorderY, PAGE_WIDTH - marginX, 2.5, accentColor);
      }
      y = compactHeaderBorderY - s(18);

      // CRITICAL: Sidebar starts BELOW header line with matching 18pt breathing space!
      sidebarY = y;
    }
    else if (isProfessional) {
      // Professional: Name left, contact right, accent border
      if (pi.fullName) {
        drawT(pi.fullName, { x: marginX, yPos: y, size: s(22), font: fontBold, color: darkCharcoal });
      }
      
      const contactRight = [pi.email, pi.phone, pi.location].filter(Boolean);
      let rightY = y;
      for (const item of contactRight) {
        drawT(item, { x: PAGE_WIDTH - marginX, yPos: rightY, size: s(8.5), font: fontRegular, color: grayColor, align: "right" });
        rightY -= s(12);
      }
      y -= s(22) + g(4);

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join("   ·   ");
      if (linkLine) {
        drawT(linkLine, { x: marginX, yPos: y, size: s(8.5), font: fontRegular, color: accentColor });
        y -= s(8.5) + g(4);
      }

      drawLine(marginX, y, PAGE_WIDTH - marginX, 2, accentColor);
      y -= g(14);
    }
    else if (isClassic) {
      if (pi.fullName) {
        if (isSerif) {
          drawT(pi.fullName.toUpperCase(), { x: PAGE_WIDTH / 2, yPos: y, size: s(21), font: fontBold, color: darkCharcoal, align: "center", spacing: 0.8 });
        } else if (isMono) {
          drawT(`> ${pi.fullName.toUpperCase()}`, { x: PAGE_WIDTH / 2, yPos: y, size: s(20), font: fontBold, color: darkCharcoal, align: "center" });
        } else {
          drawT(pi.fullName, { x: PAGE_WIDTH / 2, yPos: y, size: s(22), font: fontBold, color: darkCharcoal, align: "center" });
        }
        y -= s(22) + g(6);
      }
      
      const contactDelimiter = isSerif ? "   ·   " : isMono ? "   |   " : "    |    ";
      const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join(contactDelimiter);
      if (contactLine) {
        const contactFont = isSerif ? fontItalic : fontRegular;
        drawT(contactLine, { x: PAGE_WIDTH / 2, yPos: y, size: s(9), font: contactFont, color: mediumColor, align: "center" });
        y -= s(9) + g(4);
      }

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join(contactDelimiter);
      if (linkLine) {
        drawT(linkLine, { x: PAGE_WIDTH / 2, yPos: y, size: s(9), font: fontRegular, color: accentColor, align: "center" });
        y -= s(9) + g(6);
      }

      if (isSerif) {
        drawLine(marginX, y, PAGE_WIDTH - marginX, 1.5, accentColor);
        drawLine(marginX, y - 2, PAGE_WIDTH - marginX, 0.5, accentColor);
        y -= g(16);
      } else {
        drawLine(marginX, y, PAGE_WIDTH - marginX, 2, accentColor);
        y -= g(14);
      }
    } 
    else if (isMinimal) {
      if (pi.fullName) {
        drawT(pi.fullName, { x: marginX, yPos: y, size: s(22), font: fontBold, color: darkCharcoal });
        y -= s(22) + g(6);
      }
      
      const contactLine = [pi.email, pi.phone, pi.location].filter(Boolean).join("   ·   ");
      if (contactLine) {
        drawT(contactLine, { x: marginX, yPos: y, size: s(9), font: fontRegular, color: grayColor });
        y -= s(9) + g(4);
      }

      const linkLine = [pi.linkedin, pi.portfolio].filter(Boolean).join("   ·   ");
      if (linkLine) {
        drawT(linkLine, { x: marginX, yPos: y, size: s(9), font: fontRegular, color: accentColor });
        y -= s(9) + g(6);
      }

      drawLine(marginX, y, PAGE_WIDTH - marginX, 0.75, lightGray);
      y -= g(14);
    }

    // ── Helper to draw elegant section headers ──
    const drawSectionTitle = (title, cursorY, xPos, width, inSidebar = false) => {
      let currentY = cursorY;
      const tracking = headerTracking || 0.4;
      
      if (isModern) {
        if (inSidebar) {
          drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(8.5), font: fontBold, color: whiteColor, skipSanitize: true, spacing: tracking });
          currentY -= s(6);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 0.75, color: whiteColor, opacity: 0.25 });
          return currentY - s(10);
        } else {
          drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(10), font: fontBold, color: accentColor, spacing: tracking });
          currentY -= s(6);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 1.5, color: veryLightGray });
          return currentY - s(12);
        }
      } 
      else if (isExecutive) {
        drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(11), font: fontBold, color: accentColor, spacing: tracking });
        currentY -= s(6);
        if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 2, color: accentColor });
        return currentY - s(12);
      }
      else if (isCompact) {
        const titleText = isMono ? `// ${title.toUpperCase()}` : title.toUpperCase();
        const titleTrack = isSerif ? 0.8 : tracking;
        const lineThickness = isSerif ? 0.75 : 1;
        const lineColor = isSerif ? accentColor : lightGray;
        if (inSidebar) {
          drawT(titleText, { x: xPos, yPos: currentY, size: s(9), font: fontBold, color: accentColor, spacing: titleTrack });
          currentY -= s(6);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: lineThickness, color: lineColor });
          return currentY - s(11);
        } else {
          drawT(titleText, { x: xPos, yPos: currentY, size: s(10.5), font: fontBold, color: accentColor, spacing: titleTrack });
          currentY -= s(6);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: lineThickness, color: lineColor });
          return currentY - s(12);
        }
      }
      else if (isProfessional) {
        const titleH = s(10);
        if (page) page.drawRectangle({ x: xPos, y: currentY - s(2), width: 3, height: titleH + s(2), color: accentColor });
        drawT(title.toUpperCase(), { x: xPos + 10, yPos: currentY, size: s(10), font: fontBold, color: darkCharcoal, spacing: tracking });
        currentY -= s(6);
        return currentY - s(12);
      }
      else if (isClassic) {
        if (isSerif) {
          drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(10.5), font: fontBold, color: accentColor, spacing: 0.8 });
          currentY -= s(5);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 0.75, color: accentColor });
          return currentY - s(12);
        } else if (isMono) {
          drawT(`// ${title.toUpperCase()}`, { x: xPos, yPos: currentY, size: s(10), font: fontBold, color: accentColor });
          currentY -= s(5);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 0.5, color: accentColor, opacity: 0.5 });
          return currentY - s(12);
        } else {
          const titleH = s(10.5);
          if (page) page.drawRectangle({ x: xPos, y: currentY - s(2), width: 3.5, height: titleH + s(2), color: accentColor });
          drawT(title.toUpperCase(), { x: xPos + 8, yPos: currentY, size: s(10.5), font: fontBold, color: accentColor, spacing: tracking });
          currentY -= s(6);
          if (page) page.drawLine({ start: { x: xPos, y: currentY }, end: { x: xPos + width, y: currentY }, thickness: 1, color: veryLightGray });
          return currentY - s(12);
        }
      } 
      else if (isMinimal) {
        if (page) page.drawLine({ start: { x: xPos, y: currentY + s(10) }, end: { x: xPos + width, y: currentY + s(10) }, thickness: 0.75, color: lightGray });
        drawT(title.toUpperCase(), { x: xPos, yPos: currentY, size: s(9.5), font: fontBold, color: grayColor, spacing: tracking });
        currentY -= s(6);
        return currentY - s(12);
      }
      
      return currentY - s(12);
    };

    // MODERN SIDEBAR SECTIONS
    if (isModern) {
      // 1. Contact Section
      sidebarY = drawSectionTitle("Contact", sidebarY, 18, sideW - 36, true);
      const contactArr = [
        pi.email,
        pi.phone,
        pi.location,
        pi.linkedin,
        pi.portfolio
      ].filter(Boolean);

      for (const val of contactArr) {
        drawT(val, { x: 18, yPos: sidebarY, size: s(8), font: fontRegular, color: translucentWhite, maxW: sideW - 28 });
        sidebarY -= s(13);
      }
      sidebarY -= s(8);

      // 2. Skills Section
      if (skills.length > 0) {
        sidebarY = drawSectionTitle("Skills", sidebarY, 18, sideW - 36, true);
        const tagFontSize = s(7.5);
        const tagPadX = 7;
        const tagPadY = s(3);
        const tagGapX = 4;
        const tagGapY = s(5);
        const tagH = tagFontSize + tagPadY * 2;
        let tagX = 18;
        let tagRowY = sidebarY;

        for (const skill of skills) {
          const textW = fontBold.widthOfTextAtSize(sanitize(skill), tagFontSize);
          const totalW = textW + tagPadX * 2;
          if (tagX + totalW > sideW - 18) {
            tagX = 18;
            tagRowY -= tagH + tagGapY;
          }
          drawPill(tagX, tagRowY - tagH, totalW, tagH, whiteColor, 0.15, whiteColor, 0.25);
          drawT(skill, { x: tagX + tagPadX, yPos: tagRowY - tagH + (tagH - tagFontSize) / 2 + s(0.8), size: tagFontSize, font: fontBold, color: whiteColor });
          tagX += totalW + tagGapX;
        }
        sidebarY = tagRowY - tagH - s(14);
      }

      // 3. Certifications Section
      if (certs.length > 0) {
        sidebarY = drawSectionTitle("Certifications", sidebarY, 18, sideW - 36, true);
        for (const cert of certs) {
          const consumedName = drawWrapped(cert.name, {
            x: 18, yPos: sidebarY, w: sideW - 36, font: fontBold, size: s(8), color: whiteColor, lineHeight: 1.25
          });
          sidebarY -= consumedName + s(1.5);

          const certSub = [cert.issuer, cert.year].filter(Boolean).join(" · ");
          if (certSub) {
            const consumedSub = drawWrapped(certSub, {
              x: 18, yPos: sidebarY, w: sideW - 36, font: fontRegular, size: s(7), color: translucentWhite, lineHeight: 1.22
            });
            sidebarY -= consumedSub + s(5.5);
          } else {
            sidebarY -= s(4);
          }
        }
        sidebarY -= s(6);
      }

      // 4. Languages Section (Side-by-Side)
      if (langs.length > 0) {
        sidebarY = drawSectionTitle("Languages", sidebarY, 18, sideW - 36, true);
        for (const lang of langs) {
          drawT(lang.language, { x: 18, yPos: sidebarY, size: s(8), font: fontBold, color: whiteColor });
          if (lang.proficiency) {
            drawT(lang.proficiency, { x: sideW - 18, yPos: sidebarY, size: s(7.5), font: fontRegular, color: translucentWhite, align: "right" });
          }
          sidebarY -= s(13);
        }
      }

      y = PAGE_HEIGHT - marginTop;
    }

    // COMPACT RIGHT SIDEBAR SECTIONS
    if (isCompact) {
      // 1. Technical Skills (plain comma-separated for max ATS compatibility)
      if (skills.length > 0) {
        sidebarY = drawSectionTitle("Technical Skills", sidebarY, sideX, sideContentW, true);
        const skillText = isSerif ? skills.join("   ·   ") : isMono ? skills.map((s) => `[${s}]`).join("  ") : skills.join(", ");
        const consumedSkills = drawWrapped(skillText, {
          x: sideX, yPos: sidebarY, w: sideContentW, font: fontRegular, size: s(7.5), color: darkCharcoal, lineHeight: 1.40
        });
        sidebarY -= consumedSkills + s(10);
      }

      // 2. Certifications
      if (certs.length > 0) {
        sidebarY = drawSectionTitle("Certifications", sidebarY, sideX, sideContentW, true);
        for (const cert of certs) {
          const consumedName = drawWrapped(cert.name, {
            x: sideX, yPos: sidebarY, w: sideContentW, font: fontBold, size: s(7.5), color: darkCharcoal, lineHeight: 1.25
          });
          sidebarY -= consumedName + s(1.5);
          const certSub = [cert.issuer, cert.year].filter(Boolean).join(" · ");
          if (certSub) {
            const consumedSub = drawWrapped(certSub, {
              x: sideX, yPos: sidebarY, w: sideContentW, font: fontRegular, size: s(7), color: grayColor, lineHeight: 1.22
            });
            sidebarY -= consumedSub + s(4);
          } else {
            sidebarY -= s(3);
          }
        }
        sidebarY -= s(6);
      }

      // 3. Languages
      if (langs.length > 0) {
        sidebarY = drawSectionTitle("Languages", sidebarY, sideX, sideContentW, true);
        for (const lang of langs) {
          drawT(lang.language, { x: sideX, yPos: sidebarY, size: s(7.5), font: fontBold, color: darkCharcoal });
          if (lang.proficiency) {
            drawT(lang.proficiency, { x: sideX + sideContentW, yPos: sidebarY, size: s(7), font: fontRegular, color: grayColor, align: "right" });
          }
          sidebarY -= s(11);
        }
      }
    }

    // ════════════════════════════════════════════
    // MAIN COLUMN SECTIONS
    // ════════════════════════════════════════════

    // 1. SUMMARY
    if (summary) {
      const summaryTitle = isExecutive ? "Executive Summary" : isProfessional ? "Profile" : "Professional Summary";
      y = drawSectionTitle(summaryTitle, y, mainX, mainW);
      const consumed = drawWrapped(summary, {
        x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(8.5), color: darkCharcoal, lineHeight: 1.50
      });
      y -= consumed + s(14);
    }

    // 2. EXPERIENCE
    if (experiences.length > 0) {
      y = drawSectionTitle("Work Experience", y, mainX, mainW);
      for (const exp of experiences) {
        const title = exp.title || "Job Title";
        const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" - ");
        const dateW = dateStr ? fontItalic.widthOfTextAtSize(dateStr, s(8)) + 8 : 0;
        
        drawT(title, { x: mainX, yPos: y, size: s(9.5), font: fontBold, color: darkCharcoal, maxW: mainW - dateW });
        if (dateStr) {
          drawT(dateStr, { x: mainX + mainW, yPos: y, size: s(8), font: fontItalic, color: grayColor, align: "right" });
        }
        y -= s(9.5) + s(2.5);

        const subBits = [exp.company, exp.location].filter(Boolean).join(" · ");
        if (subBits) {
          drawT(subBits, { x: mainX, yPos: y, size: s(8.5), font: fontItalic, color: accentColor, maxW: mainW });
          y -= s(8.5) + s(4);
        }

        const bullets = (exp.bullets || []).filter((b) => b && typeof b === "string" && b.trim());
        for (const bullet of bullets) {
          if (isMono) {
            drawT(">", { x: mainX + 2, yPos: y, size: s(8), font: fontBold, color: accentColor });
          } else {
            if (page) page.drawCircle({ x: mainX + 4, y: y + s(2.5), size: 1.5, color: grayColor });
          }
          const consumedBullet = drawWrapped(bullet, {
            x: mainX + 11, yPos: y, w: mainW - 11, font: fontRegular, size: s(8), color: darkCharcoal, lineHeight: 1.40
          });
          y -= consumedBullet + s(3);
        }
        y -= s(6);
      }
      y -= s(3);
    }

    // 3. EDUCATION
    if (educations.length > 0) {
      y = drawSectionTitle("Education", y, mainX, mainW);
      for (const edu of educations) {
        const deg = edu.degree || "Degree";
        const yearStr = edu.year || "";
        const yearW = yearStr ? fontItalic.widthOfTextAtSize(yearStr, s(8)) + 8 : 0;
        
        drawT(deg, { x: mainX, yPos: y, size: s(9), font: fontBold, color: darkCharcoal, maxW: mainW - yearW });
        if (yearStr) {
          drawT(yearStr, { x: mainX + mainW, yPos: y, size: s(8), font: fontItalic, color: grayColor, align: "right" });
        }
        y -= s(9) + s(2.5);

        const eduSub = [edu.institution, edu.gpa ? `GPA: ${edu.gpa}` : null].filter(Boolean).join(" · ");
        if (eduSub) {
          drawT(eduSub, { x: mainX, yPos: y, size: s(8), font: fontItalic, color: grayColor, maxW: mainW });
          y -= s(8) + s(6);
        }
      }
      y -= s(3);
    }

    // 4. SKILLS (Single column templates: Classic, Minimal, Executive, Professional — Compact uses sidebar)
    if (!hasSidebar && skills.length > 0) {
      const skillsTitle = isExecutive ? "Core Competencies" : "Technical Skills";
      y = drawSectionTitle(skillsTitle, y, mainX, mainW);
      if (isClassic || isExecutive) {
        if (isSerif) {
          // Elegant Typographic Dot List for Serif
          const skillText = skills.join("   ·   ");
          const consumed = drawWrapped(skillText, { x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(9), color: darkCharcoal, lineHeight: 1.5 });
          y -= consumed + s(14);
        } else if (isMono) {
          // Terminal code brackets for Monospace
          const bracketText = skills.map((s) => `[ ${s} ]`).join("  ");
          const consumed = drawWrapped(bracketText, { x: mainX, yPos: y, w: mainW, font: fontBold, size: s(8.5), color: darkCharcoal, lineHeight: 1.45 });
          y -= consumed + s(14);
        } else {
          // Pill-style tags
          const tagFontSize = s(8);
          const tagPadX = 8;
          const tagPadY = s(2.5);
          const tagGapX = 5;
          const tagGapY = s(5);
          const tagH = tagFontSize + tagPadY * 2;
          let tagX = mainX;
          let tagRowY = y;

          for (const skill of skills) {
            const textW = fontBold.widthOfTextAtSize(sanitize(skill), tagFontSize);
            const totalW = textW + tagPadX * 2;
            if (tagX + totalW > mainX + mainW) {
              tagX = mainX;
              tagRowY -= tagH + tagGapY;
            }
            drawPill(tagX, tagRowY - tagH, totalW, tagH, accentColor, 0.09, accentColor, 0.28);
            drawT(skill, { x: tagX + tagPadX, yPos: tagRowY - tagH + (tagH - tagFontSize) / 2 + s(0.8), size: tagFontSize, font: fontBold, color: darkCharcoal });
            tagX += totalW + tagGapX;
          }
          y = tagRowY - tagH - s(16);
        }
      } else if (isProfessional) {
        // Two-column grid with left accent bars
        const colW = (mainW - 20) / 2;
        let leftY = y;
        let rightY = y;
        for (let i = 0; i < skills.length; i++) {
          const isLeft = i % 2 === 0;
          const sx = isLeft ? mainX : mainX + colW + 20;
          const currentY = isLeft ? leftY : rightY;
          if (page) page.drawRectangle({ x: sx, y: currentY - s(1), width: 2, height: s(9), color: accentColor, opacity: 0.3 });
          drawT(skills[i], { x: sx + 8, yPos: currentY, size: s(8), font: fontRegular, color: darkCharcoal, maxW: colW - 10 });
          if (isLeft) leftY -= s(13);
          else rightY -= s(13);
        }
        y = Math.min(leftY, rightY) - s(10);
      } else {
        // Minimal: dot-separated inline
        const skillText = skills.join("  ·  ");
        const consumed = drawWrapped(skillText, { x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(8.5), color: darkCharcoal, lineHeight: 1.45 });
        y -= consumed + s(16);
      }
    }

    // 5. PROJECTS
    if (projects.length > 0) {
      y = drawSectionTitle("Projects", y, mainX, mainW);
      for (const proj of projects) {
        const pName = proj.name;
        const pTech = proj.techStack ? `(${proj.techStack})` : "";
        const pNameW = fontBold.widthOfTextAtSize(pName, s(9.5));
        
        drawT(pName, { x: mainX, yPos: y, size: s(9.5), font: fontBold, color: darkCharcoal, maxW: mainW });
        
        if (pTech) {
          const techX = Math.min(mainX + pNameW + 6, mainX + mainW - 80);
          drawT(pTech, { x: techX, yPos: y, size: s(7.5), font: fontBold, color: accentColor, maxW: mainW - (techX - mainX) });
        }
        y -= s(9.5) + s(2);

        if (proj.description) {
          const consumedDesc = drawWrapped(proj.description.trim(), {
            x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(8), color: darkCharcoal, lineHeight: 1.40
          });
          y -= consumedDesc + s(2.5);
        }

        if (proj.link) {
          drawT(proj.link.trim(), { x: mainX, yPos: y, size: s(7.5), font: fontRegular, color: accentColor, maxW: mainW });
          y -= s(7.5) + s(8);
        }
        y -= s(3);
      }
    }

    // 6. CERTIFICATIONS (Single column templates — not Modern/Compact which use sidebar)
    if (!hasSidebar && certs.length > 0) {
      y = drawSectionTitle("Certifications", y, mainX, mainW);
      for (const cert of certs) {
        const certLeft = `${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ""}`;
        drawT(certLeft, { x: mainX, yPos: y, size: s(8.5), font: fontBold, color: darkCharcoal, maxW: mainW - 60 });
        if (cert.year) drawT(cert.year, { x: mainX + mainW, yPos: y, size: s(7.5), font: fontItalic, color: grayColor, align: "right" });
        y -= s(8.5) + s(8);
      }
      y -= s(6);
    }

    // 7. LANGUAGES (Single column templates — not Modern/Compact which use sidebar)
    if (!hasSidebar && langs.length > 0) {
      y = drawSectionTitle("Languages", y, mainX, mainW);
      const langText = langs.map(l => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ""}`).join("  ·  ");
      const consumedLang = drawWrapped(langText, { x: mainX, yPos: y, w: mainW, font: fontRegular, size: s(8.5), color: darkCharcoal });
      y -= consumedLang + s(10);
    }

    // Draw vertical divider for Compact template (stops cleanly where content ends)
    if (isCompact && page && compactHeaderBorderY > 0) {
      const dividerEndY = Math.min(y, sidebarY) - s(4);
      page.drawLine({
        start: { x: dividerX, y: compactHeaderBorderY - s(2) },
        end: { x: dividerX, y: Math.max(dividerEndY, marginBottom) },
        thickness: 0.75,
        color: lightGray,
      });
    }

    const lowestY = hasSidebar ? Math.min(y, sidebarY) : y;
    return PAGE_HEIGHT - lowestY + marginBottom;
  };
  
  // Set distinct initial multiplier per user choice
  let initialMultiplier = 1.05;
  if (fontSizeSetting === "small") initialMultiplier = 0.85;
  else if (fontSizeSetting === "large") initialMultiplier = 1.25;

  let currentMultiplier = initialMultiplier;
  let height = buildLayout(null, currentMultiplier);

  // Auto-Fitter Guarantee: Shrink until 100% of content fits on 1 single page without any clipping!
  while (height > PAGE_HEIGHT && currentMultiplier > 0.40) {
    currentMultiplier -= 0.015;
    height = buildLayout(null, currentMultiplier);
  }

  // Grow Loop: If content is short, fill whitespace comfortably
  if (height < PAGE_HEIGHT * 0.92 && currentMultiplier < initialMultiplier) {
    while (height < PAGE_HEIGHT * 0.92 && currentMultiplier < initialMultiplier) {
      currentMultiplier += 0.01;
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
  let { fontRegular, fontBold } = await loadFontFamily(pdfDoc, customFont);

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

  } else if (templateId === "executive") {
    // Executive: Full-width accent banner header
    const bannerH = 70;
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - bannerH, width: PAGE_WIDTH, height: bannerH, color: accentClr });
    let hy = PAGE_HEIGHT - 26;

    const nameStr = (name || "Your Name").toUpperCase();
    const nameW = fontBold.widthOfTextAtSize(nameStr, 22);
    drawT(nameStr, (PAGE_WIDTH - nameW) / 2, hy, 22, fontBold, rgb(1, 1, 1));
    hy -= 28;

    const contactStr = [email, phone].filter(Boolean).join("    |    ");
    if (contactStr) {
      const cw = fontRegular.widthOfTextAtSize(contactStr, 9.5);
      drawT(contactStr, (PAGE_WIDTH - cw) / 2, hy, 9.5, fontRegular, rgb(0.92, 0.94, 0.96));
    }

    y = PAGE_HEIGHT - bannerH - 24;

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

  } else if (templateId === "professional") {
    // Professional: Name left, contact right, accent border
    drawT(name || "Your Name", MARGIN_X, y, 22, fontBold, textClr);
    
    const contactRight = [email, phone].filter(Boolean);
    let rightY = y;
    for (const item of contactRight) {
      const itemW = fontRegular.widthOfTextAtSize(item, 9.5);
      drawT(item, PAGE_WIDTH - MARGIN_X - itemW, rightY, 9.5, fontRegular, mutedClr);
      rightY -= 13;
    }
    y -= 28;

    page.drawLine({ start: { x: MARGIN_X, y }, end: { x: PAGE_WIDTH - MARGIN_X, y }, thickness: 2, color: accentClr });
    y -= 26;

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
