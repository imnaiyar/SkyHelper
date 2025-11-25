import { APIPage } from "fumadocs-openapi/ui";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { openapi } from "./lib/source";
import Collapsible from "./app/components/collapsible";
import Gallery from "./app/components/gallery";
import { VideoPreview } from "./app/components/video-preview";
// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    APIPage: (props) => <APIPage {...openapi.getAPIPageProps(props)} />,
    ...components,
    Collapsible,
    Gallery,
    VideoPreview,
  };
}
