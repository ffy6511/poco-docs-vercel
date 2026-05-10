import { getPageImage, source } from "@/lib/source";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { notFound } from "next/navigation";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import { LLMCopyButton, ViewOptions } from "@/components/ai/page-actions";
import { gitConfig } from "@/lib/layout.shared";
import { isLocale } from "@/lib/i18n";
import { createDocsLink } from "@/lib/mdx-link";

export default async function Page(props: PageProps<"/[lang]/[[...slug]]">) {
  const params = await props.params;

  if (!isLocale(params.lang)) {
    notFound();
  }

  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl =
    page.slugs.length > 0
      ? `/llms.mdx/${params.lang}/docs/${page.slugs.join("/")}`
      : `/llms.mdx/${params.lang}/docs`;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <LLMCopyButton markdownUrl={markdownUrl} />
        <ViewOptions
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.org}/${gitConfig.docsRepo.name}/blob/${gitConfig.docsRepo.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createDocsLink(page, params.lang),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}

export async function generateMetadata(
  props: PageProps<"/[lang]/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;

  if (!isLocale(params.lang)) {
    notFound();
  }

  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
