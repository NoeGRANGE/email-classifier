import type { LucideIcon } from "lucide-react";
import { MailPlus, Send, Settings } from "lucide-react";

export type StepId = "upload" | "classify" | "insights";

export type StepDefinition = {
  id: StepId;
  icon: LucideIcon;
  imageSrc: string;
  titleKey: string;
  titleFallback: string;
  descriptionKey: string;
  descriptionFallback: string;
  imageAltKey: string;
  imageAltFallback: string;
};

export type StepWithContent = StepDefinition & {
  title: string;
  description: string;
  imageAlt: string;
};

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "upload",
    icon: MailPlus,
    imageSrc: "/emails.jpeg",
    titleKey: "steps.items.upload.title",
    titleFallback: "1. Add Your MailBoxes",
    descriptionKey: "steps.items.upload.description",
    descriptionFallback:
      "Securely connect your Outlook mailboxes in a few clicks.",
    imageAltKey: "steps.items.upload.image_alt",
    imageAltFallback: "Inbox upload illustration",
  },
  {
    id: "classify",
    icon: Settings,
    imageSrc: "/configuration.jpeg",
    titleKey: "steps.items.classify.title",
    titleFallback: "2. Create Categories",
    descriptionKey: "steps.items.classify.description",
    descriptionFallback:
      "Design smart categories that mirror the different types of emails in your inbox by just describing them.",
    imageAltKey: "steps.items.classify.image_alt",
    imageAltFallback: "Email classifier dashboard illustration",
  },
  {
    id: "insights",
    icon: Send,
    imageSrc: "/actions.jpeg",
    titleKey: "steps.items.insights.title",
    titleFallback: "3. Add Actions",
    descriptionKey: "steps.items.insights.description",
    descriptionFallback:
      "Easily attach automated actions - tags, replies, forward and more - to keep every lead moving.",
    imageAltKey: "steps.items.insights.image_alt",
    imageAltFallback: "Insights analytics illustration",
  },
];
