/// <reference types="vite/client" />
/// <reference types="vite-react-ssg" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ACCESS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mdx" {
  import type { MDXComponents } from "mdx/types";
  import type { ComponentType } from "react";

  export const meta: {
    title: string;
    description?: string;
  };

  const MDXContent: ComponentType<{ components?: MDXComponents }>;
  export default MDXContent;
}
