// Side-effect entry for per-component imports: registers the react-router
// adapter that `@rfdtech/components` registers on its own.
import { setRouterAdapter } from "./adapters/registry";
import { useReactRouterAdapter } from "./adapters/react-router-adapter";

setRouterAdapter(useReactRouterAdapter);
