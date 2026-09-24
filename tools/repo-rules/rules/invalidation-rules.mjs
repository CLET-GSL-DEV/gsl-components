// The invalidation map, enforced. Runs inside `pnpm rules:check` so it blocks a commit through
// the same hook as every other rule, rather than being a check someone remembers to run.
import { allSourceFiles } from '../lib/core.mjs';
import {
  composeInvalidationMap,
  danglingInvalidations,
  diffInvalidationMap,
  readDeclaredMap,
} from '../lib/invalidation.mjs';

// Composed once per run and shared by the three rules below, since composing it walks every file.
//
// It deliberately ignores the file list it is handed and always reads the WHOLE repo, even on
// the `--staged` pre-commit path. The map is a property of the repository, not of a diff:
// composed from staged files alone it would see the one endpoint you touched, conclude every
// other key had vanished, and fail the commit with a page of nonsense. For the same reason it
// reads `allSourceFiles()` rather than `allFiles()`: the base layer at `src/core` is out of
// scope for the rules but its query keys are live at runtime and belong in the map.
let cache = null;
const composed = () => (cache ??= composeInvalidationMap(allSourceFiles()));

export const invalidationKeysResolvable = {
  id: 'query-key-resolvable',
  doc: 'Every query key resolves to literal strings at declaration time.',
  why: 'A key assembled at runtime cannot be reasoned about by anything, including the person writing the mutation that is meant to invalidate it. It also cannot appear in the map, so it silently escapes every check below.',
  check() {
    return composed().problems;
  },
};

export const invalidationMapCurrent = {
  id: 'invalidation-map-current',
  doc: 'invalidation-map.json matches the query keys and invalidations in the code.',
  why: 'The map is a lockfile for cache behaviour. Committing it turns a change in what a write invalidates into a reviewable diff, instead of a silent change that surfaces later as a screen showing stale data.',
  check() {
    return diffInvalidationMap(composed().keys, readDeclaredMap());
  },
};

export const noDanglingInvalidation = {
  id: 'no-dangling-invalidation',
  doc: 'A write never invalidates a key no read subscribes to.',
  why: 'The refetch it triggers has no subscriber, so either the key is misspelt, or the read it was written for has been deleted and the screen it fed now never refreshes.',
  check() {
    const { keys } = composed();
    return danglingInvalidations(keys).map((id) => ({
      file: 'invalidation-map.json',
      line: 1,
      message: `"${id}" is invalidated by ${keys[id].invalidatedBy.length} write(s) and read by none`,
    }));
  },
};

export default [invalidationKeysResolvable, invalidationMapCurrent, noDanglingInvalidation];
