type LocaleAwareHref = (locale: string) => string;

export type FooterLinkDescriptor = {
  key: string;
  defaultLabel: string;
  href: LocaleAwareHref;
  external?: boolean;
};

export type FooterSectionDescriptor = {
  key: "product" | "resources" | "company";
  defaultTitle: string;
  links: FooterLinkDescriptor[];
};

export const FOOTER_SECTIONS: FooterSectionDescriptor[] = [
  {
    key: "product",
    defaultTitle: "Product",
    links: [
      {
        key: "overview",
        defaultLabel: "Overview",
        href: (locale) => `/${locale}`,
      },
      {
        key: "pricing",
        defaultLabel: "Pricing",
        href: (locale) => `/${locale}#plans`,
      },
      {
        key: "automation",
        defaultLabel: "Automation templates",
        href: (locale) => `/${locale}#steps`,
      },
    ],
  },
  {
    key: "company",
    defaultTitle: "Company",
    links: [
      {
        key: "about",
        defaultLabel: "About",
        href: () => "https://grangeco.app",
        external: true,
      },
      {
        key: "contact",
        defaultLabel: "Contact",
        href: () => "mailto:ngrange.dev@gmail.com",
        external: true,
      },
    ],
  },
];

export const FOOTER_LEGAL_LINKS: FooterLinkDescriptor[] = [
  // {
  //   key: "privacy",
  //   defaultLabel: "Privacy",
  //   href: (locale) => `/${locale}/legal/privacy`,
  // },
  // {
  //   key: "terms",
  //   defaultLabel: "Terms",
  //   href: (locale) => `/${locale}/legal/terms`,
  // },
  // {
  //   key: "security",
  //   defaultLabel: "Security",
  //   href: (locale) => `/${locale}/legal/security`,
  // },
];
