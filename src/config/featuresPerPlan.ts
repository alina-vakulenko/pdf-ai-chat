import { FREE_PLAN, PRO_PLAN } from "./stripe";

export const featuresPerPlan = [
  {
    plan: FREE_PLAN.name,
    tagline: "For small side projects.",
    quota: FREE_PLAN.quota,
    features: [
      {
        text: `${FREE_PLAN.pagesPerPdf} pages per PDF`,
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: `${FREE_PLAN.maxSizeBytes / (1024 * 1024)}MB file size limit`,
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        negative: true,
      },
      {
        text: "Priority support",
        negative: true,
      },
    ],
  },
  {
    plan: PRO_PLAN.name,
    tagline: "For larger projects with higher needs.",
    quota: PRO_PLAN.quota,
    features: [
      {
        text: `${PRO_PLAN.pagesPerPdf} pages per PDF`,
        footnote: "The maximum amount of pages per PDF-file.",
      },
      {
        text: `${PRO_PLAN.maxSizeBytes / (1024 * 1024)}MB file size limit`,
        footnote: "The maximum file size of a single PDF file.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
      },
      {
        text: "Priority support",
      },
    ],
  },
];
