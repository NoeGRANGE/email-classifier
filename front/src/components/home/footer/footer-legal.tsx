import Link from "next/link";

import styles from "./footer.module.css";
import type { FooterLinkItem } from "./footer-section";

type FooterLegalProps = {
  copyright: string;
  links: FooterLinkItem[];
};

export function FooterLegal({ copyright, links }: FooterLegalProps) {
  return (
    <div className={styles.bottomRow}>
      <p className={styles.copyright}>{copyright}</p>
      <ul className={styles.legalLinks}>
        {links.map(({ key, label, href, external }) => (
          <li key={key}>
            {external ? (
              <a
                href={href}
                className={styles.legalLink}
                target="_blank"
                rel="noreferrer noopener"
              >
                {label}
              </a>
            ) : (
              <Link href={href} className={styles.legalLink}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
