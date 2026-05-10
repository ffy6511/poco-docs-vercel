import Link from "next/link";
import path from "node:path";
import type { ReactNode } from "react";

type DocsPageLike = {
  path: string;
};

type AnchorProps = {
  href?: string;
  children?: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href"> &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;

function isExternalHref(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href);
}

function buildDocsBasePath(pagePath: string, lang: string): string {
  const normalized = pagePath.replace(/\\/g, "/");
  const prefix = `${lang}/`;
  const withoutLang = normalized.startsWith(prefix)
    ? normalized.slice(prefix.length)
    : normalized;
  const withoutExtension = withoutLang.replace(/\.mdx?$/i, "");

  if (withoutExtension === "index") {
    return `/${lang}`;
  }

  if (withoutExtension.endsWith("/index")) {
    return `/${lang}/${withoutExtension.slice(0, -"/index".length)}`;
  }

  const dirname = path.posix.dirname(withoutExtension);
  return dirname === "."
    ? `/${lang}`
    : `/${lang}/${dirname}`;
}

function resolveDocsHref(href: string, pagePath: string, lang: string): string {
  if (!href || isExternalHref(href) || href.startsWith("#")) {
    return href;
  }

  if (href.startsWith("/")) {
    return href;
  }

  const basePath = buildDocsBasePath(pagePath, lang);
  const baseUrl = new URL(`${basePath.replace(/\/$/, "")}/`, "https://docs.local");
  const resolved = new URL(href, baseUrl);
  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

export function createDocsLink(page: DocsPageLike, lang: string) {
  return function DocsLink({ href, children, ...props }: AnchorProps) {
    if (!href) {
      return <a {...props}>{children}</a>;
    }

    const resolvedHref = resolveDocsHref(href, page.path, lang);

    if (isExternalHref(resolvedHref)) {
      return (
        <a href={resolvedHref} {...props}>
          {children}
        </a>
      );
    }

    return (
      <Link href={resolvedHref} {...props}>
        {children}
      </Link>
    );
  };
}
