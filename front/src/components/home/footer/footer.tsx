"use client";

import React from "react";

import { AppBrandLink } from "@/components/layout/app-brand-link";
import { useTranslations } from "@/i18n/use-translations";

import { FooterLegal } from "./footer-legal";
import { FooterSection, type FooterLinkItem } from "./footer-section";
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_SECTIONS,
} from "./footer-links";
import styles from "./footer.module.css";

function formatYearPlaceholder(template: string, year: number) {
  return template.replace(/\{year\}/gi, year.toString());
}

export default function HomeFooter() {
  const { t, locale } = useTranslations("home");
  const currentYear = new Date().getFullYear();

  const sections = React.useMemo(
    () =>
      FOOTER_SECTIONS.map((section) => ({
        key: section.key,
        title: t(
          `footer.sections.${section.key}.title`,
          section.defaultTitle
        ),
        links: section.links.map<FooterLinkItem>((link) => ({
          key: link.key,
          label: t(
            `footer.sections.${section.key}.links.${link.key}`,
            link.defaultLabel
          ),
          href: link.href(locale),
          external: link.external,
        })),
      })),
    [locale, t]
  );

  const legalLinks = React.useMemo(
    () =>
      FOOTER_LEGAL_LINKS.map<FooterLinkItem>((link) => ({
        key: link.key,
        label: t(`footer.legal.${link.key}`, link.defaultLabel),
        href: link.href(locale),
        external: link.external,
      })),
    [locale, t]
  );

  const tagline = t(
    "footer.tagline",
    "Smarter inbox automation for growing startups."
  );

  const copyrightTemplate = t(
    "footer.legal.copyright",
    "© {year} Linbolt. All rights reserved."
  );
  const copyright = formatYearPlaceholder(copyrightTemplate, currentYear);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <div className={styles.brand}>
            <AppBrandLink className={styles.brandLink} />
            <p className={styles.tagline}>{tagline}</p>
          </div>
          <div className={styles.sections}>
            {sections.map((section) => (
              <FooterSection
                key={section.key}
                title={section.title}
                links={section.links}
              />
            ))}
          </div>
        </div>
        <FooterLegal copyright={copyright} links={legalLinks} />
      </div>
    </footer>
  );
}
