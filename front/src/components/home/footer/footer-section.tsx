import Link from "next/link";

import styles from "./footer.module.css";

export type FooterLinkItem = {
  key: string;
  label: string;
  href: string;
  external?: boolean;
};

type FooterSectionProps = {
  title: string;
  links: FooterLinkItem[];
};

export function FooterSection({ title, links }: FooterSectionProps) {
  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{title}</p>
      <ul className={styles.linkList}>
        {links.map(({ key, label, href, external }) => (
          <li key={key}>
            {external ? (
              <a
                href={href}
                className={styles.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                {label}
              </a>
            ) : (
              <Link href={href} className={styles.link}>
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
