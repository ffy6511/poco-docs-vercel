import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { isLocale } from "@/lib/i18n";
import { i18nUI } from "@/lib/i18n-ui";
import { baseOptions } from "@/lib/layout.shared";
import { notFound } from "next/navigation";

export default async function Layout({
  children,
  params,
}: LayoutProps<"/[lang]/[[...slug]]">) {
  const { lang } = await params;

  if (!isLocale(lang)) {
    notFound();
  }

  return (
    <RootProvider i18n={i18nUI.provider(lang)}>
      <DocsLayout
        containerProps={{ className: "[--fd-layout-width:100dvw]" }}
        tree={source.getPageTree(lang)}
        {...baseOptions(lang)}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
