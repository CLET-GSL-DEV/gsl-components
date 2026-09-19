import type { HTMLAttributes } from "react";
import type { CletVersion } from "./version";

export interface VersionPinClassNames {
  root?: string;
}

export interface VersionPinProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Frozen version to render inside this subtree. The pin is additive:
   * latest needs no pin (omit this wrapper); older versions stamp
   * `data-clet-version` so `src/styles/versions.css` can freeze them.
   */
  version: CletVersion;
  classNames?: VersionPinClassNames;
  className?: string;
}
