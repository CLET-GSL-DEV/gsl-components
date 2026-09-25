// Rules that guard the API layer: where endpoints may be declared, that every read carries a
// cache key, that every write says what it invalidates, and that nothing hand-rolls HTTP.
// The endpoint system in `@core/api-client` is the ONLY API-calling pattern in this app.
import { ast, isEndpointModule, lineOf, read, rel, ts, visit } from '../lib/core.mjs';

const FACTORY = /^(GET|POST|PATCH|PUT|DELETE)$/;
const WRITE = /^(POST|PATCH|PUT|DELETE)$/;

/** Every `GET(...)` / `POST(...)` endpoint declaration in a file, as { name, node, config }. */
function endpointDefs(src) {
  const found = [];
  visit(src, (node) => {
    if (!ts.isCallExpression(node)) return;
    const name = node.expression.getText();
    if (!FACTORY.test(name)) return;
    const config = node.arguments[0];
    if (!config || !ts.isObjectLiteralExpression(config)) return;
    found.push({ name, node, config });
  });
  return found;
}

const hasProp = (config, prop) =>
  config.properties.some((p) => ts.isPropertyAssignment(p) && p.name.getText() === prop);

export const endpointDefsLiveInApiModule = {
  id: 'endpoint-defs-in-api-module',
  doc: 'api-integration skill: endpoint definitions live in an api module, never inline in a component or hook.',
  why: "An endpoint declared next to the component that calls it cannot be reused, cannot be invalidated by name, and hides the app's real API surface from anyone reading it.",
  check(files) {
    const out = [];
    for (const f of files) {
      if (/src\/core\/api-client\//.test(f)) continue;
      // `src/api/`, `foo.endpoints.ts`, `foo-endpoints.ts` and `foo-api.ts` all name themselves as
      // the api module. The hyphen form is what records-archive-frontend uses under
      // `src/domain/*/services/`, and rejecting it reported 128 endpoint definitions as misplaced
      // when every one was in a file that says what it is.
      const ok = isEndpointModule(f);
      if (ok) continue;
      const src = ast(f);
      for (const { name, node } of endpointDefs(src)) {
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `${name}() endpoint declared outside an api module, move it to src/api/ or a *.endpoints.ts file`,
        });
      }
    }
    return out;
  },
};

export const queryEndpointHasKey = {
  id: 'endpoint-has-query-key',
  doc: 'api-integration skill: every GET endpoint declares a queryKey.',
  why: 'queryKey is the TanStack cache identity. Without one the read is uncacheable and no mutation can ever invalidate it, so the screen goes stale and only a reload fixes it.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (/src\/core\/api-client\//.test(f)) continue;
      const src = ast(f);
      for (const { name, node, config } of endpointDefs(src)) {
        if (name !== 'GET') continue;
        if (hasProp(config, 'queryKey')) continue;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: 'GET endpoint has no queryKey, add one so it can be cached and invalidated',
        });
      }
    }
    return out;
  },
};

export const mutationEndpointInvalidates = {
  id: 'endpoint-declares-invalidates',
  doc: 'api-integration skill: every write endpoint declares what it invalidates.',
  why: 'A write that invalidates nothing leaves the list it just changed showing the old rows. That reads as a failed save and is the single most common integration defect.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (/src\/core\/api-client\//.test(f)) continue;
      const src = ast(f);
      for (const { name, node, config } of endpointDefs(src)) {
        if (!WRITE.test(name)) continue;
        if (hasProp(config, 'invalidates')) continue;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `${name} endpoint has no invalidates, list the queryKeys it makes stale`,
        });
      }
    }
    return out;
  },
};

export const endpointFullyTyped = {
  id: 'endpoint-fully-typed',
  doc: 'api-integration skill: every endpoint declares its response, and every write its body.',
  why: 'Without explicit type arguments the factories infer `void` for the response, so `data` is typed as nothing and every call site reads it through a cast. The types are the only contract between this app and its backend; an untyped endpoint means a field rename ships silently.',
  check(files) {
    const out = [];
    for (const f of files) {
      if (/src\/core\/api-client\//.test(f)) continue;
      const src = ast(f);
      for (const { name, node } of endpointDefs(src)) {
        const args = node.typeArguments ?? [];
        const line = lineOf(src, node.getStart());

        const loose = args.find((a) => /^(any|unknown\[\]|object)$/.test(a.getText()));
        if (loose) {
          out.push({
            file: rel(f),
            line,
            message: `${name}() is typed as \`${loose.getText()}\`, which is not a contract, describe the real shape`,
          });
        }

        // DELETE has nothing for a call site to declare, so it is complete bare.
        //
        // This rule used to demand `DELETE<Response>` and report `DELETE({ ... })` as untyped,
        // which was the rule reading a signature that does not exist. The helper is
        // `DELETE = <TQuery = never>(def: Omit<EndpointDef<void, never, TQuery>, 'method'>)`
        // (`src/core/api-client/api-methods.ts`): the response is `void` BY CONSTRUCTION and the
        // one type argument is the QUERY. There was no response type to write, so the only way to
        // satisfy the question as asked was to invent a type argument that then silently meant
        // "this delete takes a query of that shape" - a worse declaration than the gap, and
        // exactly the kind of edit a lint failure pressures somebody into. A DELETE is fully
        // typed with no arguments; with one, that argument is checked for looseness above like
        // any other.
        if (name === 'DELETE') continue;

        if (!args.length) {
          out.push({
            file: rel(f),
            line,
            message: `${name}() declares no types, write ${name}<Response${WRITE.test(name) ? ', Body' : ''}>({ ... })`,
          });
          continue;
        }
        if (WRITE.test(name) && args.length < 2) {
          out.push({
            file: rel(f),
            line,
            message: `${name}() declares a response but no request body type`,
          });
        }
      }
    }
    return out;
  },
};

export const noRawHttp = {
  id: 'no-raw-http',
  doc: 'api-integration skill: no fetch, no axios, no bare client.get outside the api-client layer.',
  why: 'A hand-rolled request skips the auth header, the error envelope, the multipart encoder and the toast layer, so it fails differently from every other call in the app.',
  check(files) {
    const out = [];
    for (const f of files) {
      // api-client IS the HTTP layer, and a test may legitimately stub the global.
      if (/src\/core\/api-client\//.test(f)) continue;
      // The auth layer is the identity transport: it calls the IdP directly, before an api client
      // exists and with a different token lifecycle. It is not the product API surface.
      if (/src\/core\/auth\//.test(f)) continue;
      // A test HELPER is the case this skip already names, and `foo.test-utils.ts` was not
      // matching. The segment must still be `.test.` or `.spec.` so a product file that merely
      // reads as a test, IngestionTester.tsx, stays in scope.
      if (/\.(test|spec)([.-][\w.-]*)?\.tsx?$/.test(f)) continue;
      const src = ast(f);
      visit(src, (node) => {
        if (!ts.isCallExpression(node)) return;
        const callee = node.expression.getText();
        const raw =
          callee === 'fetch' ||
          callee === 'window.fetch' ||
          /^axios(\.\w+)?$/.test(callee) ||
          /^(api|client|http)\.(get|post|put|patch|delete|request)$/.test(callee);
        if (!raw) return;
        out.push({
          file: rel(f),
          line: lineOf(src, node.getStart()),
          message: `${callee}() hand-rolls HTTP, declare an endpoint and use useQueryEndpoint / useMutationEndpoint`,
        });
      });
      // An axios instance created outside the api-client layer is the same defect one level up.
      read(f)
        .split('\n')
        .forEach((line, i) => {
          // `import type { AxiosInstance }` carries no runtime call, only a signature.
          if (/^\s*import\s+(?!type\b).*\bfrom\s+['"]axios['"]/.test(line)) {
            out.push({
              file: rel(f),
              line: i + 1,
              message: 'axios imported outside the api-client layer, use the endpoint system',
            });
          }
        });
    }
    return out;
  },
};

export default [
  endpointDefsLiveInApiModule,
  queryEndpointHasKey,
  mutationEndpointInvalidates,
  endpointFullyTyped,
  noRawHttp,
];
