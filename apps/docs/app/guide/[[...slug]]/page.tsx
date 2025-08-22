import { source } from "@/lib/source";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { Metadata } from "next";
import { GithubInfo } from "fumadocs-ui/components/github-info";
import { FaDiscord } from "react-icons/fa6";
import { DISCORD_SERVER } from "@/lib/constants";

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDXContent = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      lastUpdate={page.data.lastModified ? new Date(page.data.lastModified.toLocaleString()) : new Date()}
    >
      <h1 className="text-3xl font-semibold">{page.data.title}</h1>
      <p className="text-lg text-fd-muted-foreground">{page.data.description}</p>
      <div className="flex flex-row gap-3 items-center border-b pb-6">
        <a href={DISCORD_SERVER} target="_blank" rel="noreferrer noopener">
          <FaDiscord className="hover:text-indigo-500" />
        </a>
        <GithubInfo owner="imnaiyar" repo="skyhelper" className="flex flex-row lg:-mx-2" />
      </div>
      <DocsBody>
        <MDXContent
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
        {/*  <a
          href={`https://github.com/fuma-nama/fumadocs/blob/main/content/docs/${page.path}`}
          rel="noreferrer noopener"
          target="_blank"
          className="w-fit border rounded-xl p-2 font-medium text-sm text-fd-secondary-foreground bg-fd-secondary transition-colors hover:text-fd-accent-foreground hover:bg-fd-accent"
        >
          Edit on GitHub
        </a> */}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const image = ["/og", ...(params.slug ?? []), "image.png"].join("/");
  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: image,
    },
    twitter: {
      card: "summary_large_image",
      images: image,
    },
  } satisfies Metadata;
}
