/**
 * Everything personal the desktop shows about you lives in this one file.
 *
 * FILL IN: every value marked "FILL IN" below is a placeholder that was never
 * checked against your real details. Replace them before publishing.
 */

export interface ContactDetails {
  /** e.g. "you@yourdomain.com" */
  email: string;
  /** Full URL, e.g. "https://github.com/your-handle" */
  github: string;
  /** Full URL, e.g. "https://www.linkedin.com/in/your-handle" */
  linkedin: string;
}

export interface ContactLink {
  label: string;
  text: string;
  href: string;
}

const withoutScheme = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Empty details are left out, so nothing half-filled is ever shown to a visitor. */
export const contactLinks = (contact: ContactDetails): ContactLink[] => [
  ...(contact.email ? [{ label: 'E-mail', text: contact.email, href: `mailto:${contact.email}` }] : []),
  ...(contact.github ? [{ label: 'GitHub', text: withoutScheme(contact.github), href: contact.github }] : []),
  ...(contact.linkedin ? [{ label: 'LinkedIn', text: withoutScheme(contact.linkedin), href: contact.linkedin }] : []),
];

export const profile = {
  name: 'Suriya',
  role: 'AI Engineer',

  // FILL IN: your real contact details. Leave a value empty to hide that row.
  contact: {
    email: '',
    github: '',
    linkedin: '',
  } satisfies ContactDetails,

  // FILL IN: ABOUT_ME.TXT and RESUME.TXT are placeholder text. The employers,
  // dates, degrees and percentages in RESUME.TXT are not verified facts.
  files: {
  'ABOUT_ME.TXT': `SURIYA - AI ENGINEER EXTRAORDINAIRE
----------------------------------
MISSION: Architecting state-of-the-art neural intelligence systems, blending cutting-edge deep learning frameworks with bulletproof server architectures.

CURRENT DATE: 2026-07-16
LOCATION: San Francisco, CA
CHASSIS CPU: Intel 80286 (Runs hot!)
SYSTEM MEMORY: 640 KB RAM (More than enough for anyone!)

CORE SPECIALTIES:
 - Large Language Model Training & Fine-Tuning
 - Advanced Retrieval-Augmented Generation (RAG)
 - Edge AI & Quantized Real-Time Computer Vision
 - Highly scalable full-stack backend development

"The best way to predict the future is to program it."`,
  'RESUME.TXT': `SURIYA - PROFESSIONAL ADVENTURES
==================================================

WORK EXPERIENCE:
--------------------------------------------------
1. Lead AI Systems Engineer | Cyberdyne Labs
   (2024 - Present)
   * Spearheaded hybrid graph-vector retrieval networks, scaling context retrieval databases to millions of nodes.
   * Fine-tuned local domain LLMs (8B to 70B parameters) improving target accuracy by 24%.
   * Cut cloud training and inference costs by 45% using advanced model distillation and quantization.

2. Deep Learning Researcher | TechNeuro Inc.
   (2022 - 2024)
   * Designed real-time computer vision classifiers for embedded platforms, using custom quantization.
   * Published internal pipelines for automated dataset synthetic generation and curation.

EDUCATION:
--------------------------------------------------
* M.S. in Computer Science (Artificial Intelligence)
  Stanford University, 2022
* B.S. in Software Engineering
  University of California, Berkeley, 2020`
} as Record<string, string>,

  // FILL IN: replace with your real projects.
  projects: [
  {
    id: 'neuro85',
    name: 'DEEP-NEURO-85',
    summary: 'CUDA Optimized EGA Neural Framework',
    stack: 'Python, PyTorch, CUDA, Assembly 80286',
    description: 'An advanced retro-fitted neural architecture compiled for extreme low-memory hardware constraints, optimizing weight layers using specialized 16-bit register packing.'
  },
  {
    id: 'omnirag',
    name: 'OMNISCIENCE RAG v2',
    summary: 'Enterprise Semantic Search Graph',
    stack: 'Qdrant, LangChain, Hybrid Search, FastAPI',
    description: 'State-of-the-art retrieval pipeline mapping context embeddings across heterogeneous vector clouds. Features recursive summary chunks, self-cleaning indexes, and real-time inference routing.'
  },
  {
    id: 'edgevision',
    name: 'EDGE-VISION TPU',
    summary: 'Real-Time Edge TPU YOLO Detection',
    stack: 'YOLOv11, TensorRT, C++, OpenCV',
    description: 'Ultra-low latency object tracking architecture distilled for embedded 15W edge chips. Employs precision integer quantization scaling to maintain 60FPS feed processing.'
  }
],
};
