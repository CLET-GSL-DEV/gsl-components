/**
 * Tags a component for slot detection (`child.type.componentId`) and returns
 * the same component. Called as `/* @__PURE__ *\/ withComponentId(...)` in
 * place of a top-level `X.componentId = "X"` assignment, which bundlers treat
 * as a side effect and so keep `X` in apps that never use it.
 */
export function withComponentId<T extends object>(component: T, id: string): T {
  (component as { componentId?: string }).componentId = id;
  return component;
}
