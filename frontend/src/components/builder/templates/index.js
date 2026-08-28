import ClassicTemplate from "./ClassicTemplate";
import ModernTemplate from "./ModernTemplate";
import MinimalTemplate from "./MinimalTemplate";
import ExecutiveTemplate from "./ExecutiveTemplate";
import CompactTemplate from "./CompactTemplate";
import ProfessionalTemplate from "./ProfessionalTemplate";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean, ATS-friendly single-column layout trusted across MNCs and campus placements.",
    component: ClassicTemplate,
    tags: ["ATS-Safe", "Professional"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Two-column sidebar design — stands out while staying fully recruiter-approved.",
    component: ModernTemplate,
    tags: ["Two-Column", "Standout"],
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Whitespace-first layout with sharp typographic hierarchy. Ideal for design and finance.",
    component: MinimalTemplate,
    tags: ["Clean", "Elegant"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Bold dark header banner with prominent name. Built for senior roles and leadership.",
    component: ExecutiveTemplate,
    tags: ["Leadership", "Bold"],
  },
  {
    id: "compact",
    name: "Compact",
    description: "Dense two-column layout packing maximum content. Perfect for engineers and data scientists.",
    component: CompactTemplate,
    tags: ["Dense", "Technical"],
  },
  {
    id: "professional",
    name: "Professional",
    description: "Structured left-aligned layout with accent bars. Universally ATS-compatible and clean.",
    component: ProfessionalTemplate,
    tags: ["Universal", "ATS-Safe"],
  },
];

export default TEMPLATES;
