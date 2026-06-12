import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";

export interface DocPageModule {
  default: ComponentType<{ components?: MDXComponents }>;
  meta: {
    title: string;
    description?: string;
  };
}

const pages = import.meta.glob<DocPageModule>("./pages/*.mdx", { eager: true });

export function getDocPage(slug: string): DocPageModule | undefined {
  return pages[`./pages/${slug}.mdx`];
}

export function getAllDocSlugs(): string[] {
  return Object.keys(pages).map((path) => path.replace("./pages/", "").replace(".mdx", ""));
}
