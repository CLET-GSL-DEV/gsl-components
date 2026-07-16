import { useEffect, useState } from "react";

/**
 * Returns false on the initial render and true from the next render onward.
 *
 * Use this to gate a structural (not just className) branch that depends on
 * client-only state (e.g. a viewport media query) which SSR/static
 * prerendering can't know. Server output and the first client render both
 * see `false`, so hydration matches; the branch flips a frame after mount.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
