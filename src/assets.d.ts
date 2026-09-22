declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

// Shorthand so side-effect CSS imports (`import "./styles/x.css"`, inlined
// by vite-plugin-lib-inject-css) resolve when emitting declarations.
declare module "*.css";
