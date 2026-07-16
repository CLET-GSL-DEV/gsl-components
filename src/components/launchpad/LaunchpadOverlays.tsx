import { useId, type ComponentType } from "react";
import { cn } from "../../utils/cn";

/**
 * Nine decorative overlay shapes for `LaunchpadIconTile` — rings and
 * swooshes, each with a fixed size/anchor baked in (an overlay's alignment
 * is part of its identity; it's never reused with another overlay's
 * placement). Marks are solid white — dimmed to a translucent sheen via the
 * `.clet-launchpad__tile-overlay` opacity rule — so they read consistently
 * against all 9 gradients (same reasoning as the white glyph on top: every
 * gradient in the palette is dark/saturated enough to carry white). A dark
 * stroke would all but disappear on the darker gradients in the set.
 * Gradient and overlay are chosen by independent hashes — see
 * `stringToColor.ts`.
 */

const OVERLAY_STROKE = "#000";

function overlayClass(index: number) {
  return cn(
    "clet-launchpad__tile-overlay gsl-launchpad__tile-overlay",
    `clet-launchpad__tile-overlay--${index} gsl-launchpad__tile-overlay--${index}`,
  );
}

// 0 — w-50% bottom-right
function LaunchpadOverlay0() {
  return (
    <svg
      className={overlayClass(0)}
      viewBox="0 0 24 33"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="26.3333"
        cy="26.3333"
        r="22.8333"
        stroke={OVERLAY_STROKE}
        strokeWidth={7}
      />
    </svg>
  );
}

// 1 — w-80% bottom-right
function LaunchpadOverlay1() {
  return (
    <svg
      className={overlayClass(1)}
      viewBox="0 0 40 39"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.04443 -6.33268C3.83787 -0.43199 -1.35255 44.102 13.1005 35.1492C21.8347 29.7389 40.2693 29.3089 41.7111 33.6496"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 2 — h-95% top-right
function LaunchpadOverlay2() {
  return (
    <svg
      className={overlayClass(2)}
      viewBox="0 0 37 33"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.05029 40.6523C3.78057 34.749 4.90017 17.6498 18.8442 26.6065C27.2708 32.0193 38.929 4.99501 40.32 0.652344"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 3 — w-97% top-right
function LaunchpadOverlay3() {
  return (
    <svg
      className={overlayClass(3)}
      viewBox="0 0 40 37"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.05225 -6.33398C3.84569 -0.135511 5.00615 17.8187 19.4592 8.41411C28.1934 2.73075 40.2771 31.1062 41.7189 35.666"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 4 — w-100%, vertically centered
function LaunchpadOverlay4() {
  return (
    <svg
      className={overlayClass(4)}
      viewBox="0 0 40 34"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M48.9473 31.593C43.8664 28.0974 20.1615 -9.95904 14.4422 6.0513C10.9859 15.7266 -3.15988 27.5554 -6.99329 25.0602"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 5 — h-full top-right
function LaunchpadOverlay5() {
  return (
    <svg
      className={overlayClass(5)}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.05225 -5.33157C3.84569 0.866899 3.2659 45.5728 17.7189 36.1682C26.4531 30.4848 41.4438 3.94206 42.8856 8.50186"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 6 — w-97% top-right
function LaunchpadOverlay6() {
  return (
    <svg
      className={overlayClass(6)}
      viewBox="0 0 40 37"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.05225 -6.33398C3.84569 -0.135511 5.00615 17.8187 19.4592 8.41411C28.1934 2.73075 40.2771 31.1062 41.7189 35.666"
        stroke={OVERLAY_STROKE}
        strokeWidth={4.27333}
      />
    </svg>
  );
}

// 7 — w-95% bottom-right
function LaunchpadOverlay7() {
  const maskId = `clet-launchpad-icon-overlay-7-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      className={overlayClass(7)}
      viewBox="0 0 38 12"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <mask id={maskId} fill="white">
        <path d="M2.3455e-05 11.522C3.26365 6.72455 8.02037 3.13934 13.5311 1.32337C19.0419 -0.492605 24.9982 -0.437658 30.4745 1.47967C35.9509 3.397 40.6407 7.06936 43.8152 11.9262C46.9898 16.783 48.4714 22.5523 48.0298 28.3378L41.2481 27.8202C41.5756 23.529 40.4767 19.2498 38.1221 15.6474C35.7674 12.045 32.2889 9.32116 28.227 7.89905C24.1651 6.47693 19.7473 6.43617 15.6598 7.78311C11.5724 9.13005 8.04425 11.7893 5.62356 15.3476L2.3455e-05 11.522Z" />
      </mask>
      <path
        d="M2.3455e-05 11.522C3.26365 6.72455 8.02037 3.13934 13.5311 1.32337C19.0419 -0.492605 24.9982 -0.437658 30.4745 1.47967C35.9509 3.397 40.6407 7.06936 43.8152 11.9262C46.9898 16.783 48.4714 22.5523 48.0298 28.3378L41.2481 27.8202C41.5756 23.529 40.4767 19.2498 38.1221 15.6474C35.7674 12.045 32.2889 9.32116 28.227 7.89905C24.1651 6.47693 19.7473 6.43617 15.6598 7.78311C11.5724 9.13005 8.04425 11.7893 5.62356 15.3476L2.3455e-05 11.522Z"
        stroke={OVERLAY_STROKE}
        strokeWidth={14}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

// 8 — w-full, top-10%
function LaunchpadOverlay8() {
  const maskId = `clet-launchpad-icon-overlay-8-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      className={overlayClass(8)}
      viewBox="0 0 40 29"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <mask id={maskId} fill="white">
        <path d="M-4.69629 11.522C-1.43267 6.7246 3.32406 3.13939 8.83484 1.32341C14.3456 -0.49256 20.3019 -0.437612 25.7782 1.47972C31.2546 3.39705 35.9443 7.0694 39.1189 11.9262C42.2935 16.783 43.7751 22.5523 43.3335 28.3378L36.5518 27.8202C36.8793 23.529 35.7804 19.2498 33.4257 15.6474C31.0711 12.0451 27.5926 9.32121 23.5307 7.89909C19.4688 6.47697 15.051 6.43622 10.9635 7.78316C6.87608 9.1301 3.34794 11.7893 0.927255 15.3476L-4.69629 11.522Z" />
      </mask>
      <path
        d="M-4.69629 11.522L-10.484 7.58471L-14.4213 13.3724L-8.63359 17.3097L-4.69629 11.522ZM43.3335 28.3378L42.8008 35.3175L49.7805 35.8502L50.3132 28.8705L43.3335 28.3378ZM36.5518 27.8202L29.5721 27.2875L29.0394 34.2672L36.0191 34.7999L36.5518 27.8202ZM0.927255 15.3476L-3.01005 21.1354L2.77766 25.0727L6.71497 19.2849L0.927255 15.3476ZM-4.69629 11.522L1.09142 15.4593C3.4875 11.9372 6.97978 9.30499 11.0257 7.97174L8.83484 1.32341L6.64401 -5.32492C-0.331658 -3.02622 -6.35283 1.51203 -10.484 7.58471L-4.69629 11.522ZM8.83484 1.32341L11.0257 7.97174C15.0716 6.6385 19.4445 6.67884 23.4651 8.0865L25.7782 1.47972L28.0913 -5.12706C21.1593 -7.55406 13.6197 -7.62361 6.64401 -5.32492L8.83484 1.32341ZM25.7782 1.47972L23.4651 8.0865C27.4857 9.49416 30.9289 12.1903 33.2595 15.7561L39.1189 11.9262L44.9783 8.09635C40.9598 1.94849 35.0234 -2.70006 28.0913 -5.12706L25.7782 1.47972ZM39.1189 11.9262L33.2595 15.7561C35.5902 19.3218 36.678 23.5575 36.3538 27.8051L43.3335 28.3378L50.3132 28.8705C50.8721 21.5471 48.9967 14.2442 44.9783 8.09635L39.1189 11.9262ZM43.3335 28.3378L43.8662 21.3581L37.0845 20.8405L36.5518 27.8202L36.0191 34.7999L42.8008 35.3175L43.3335 28.3378ZM36.5518 27.8202L43.5315 28.3529C43.9764 22.5238 42.4836 16.711 39.2851 11.8176L33.4257 15.6474L27.5664 19.4773C29.0771 21.7886 29.7822 24.5342 29.5721 27.2875L36.5518 27.8202ZM33.4257 15.6474L39.2851 11.8176C36.0866 6.92414 31.3615 3.2241 25.8438 1.29231L23.5307 7.89909L21.2176 14.5059C23.8238 15.4183 26.0556 17.166 27.5664 19.4773L33.4257 15.6474ZM23.5307 7.89909L25.8438 1.29231C20.3262 -0.639476 14.325 -0.694837 8.7727 1.13483L10.9635 7.78316L13.1544 14.4315C15.7769 13.5673 18.6115 13.5934 21.2176 14.5059L23.5307 7.89909ZM10.9635 7.78316L8.7727 1.13483C3.22036 2.9645 -1.57223 6.57674 -4.86046 11.4103L0.927255 15.3476L6.71497 19.2849C8.26811 17.0019 10.5318 15.2957 13.1544 14.4315L10.9635 7.78316ZM0.927255 15.3476L4.86456 9.55993L-0.75898 5.7343L-4.69629 11.522L-8.63359 17.3097L-3.01005 21.1354L0.927255 15.3476Z"
        fill={OVERLAY_STROKE}
        mask={`url(#${maskId})`}
      />
    </svg>
  );
}

export const LAUNCHPAD_OVERLAYS: ComponentType[] = [
  LaunchpadOverlay0,
  LaunchpadOverlay1,
  LaunchpadOverlay2,
  LaunchpadOverlay3,
  LaunchpadOverlay4,
  LaunchpadOverlay5,
  LaunchpadOverlay6,
  LaunchpadOverlay7,
  LaunchpadOverlay8,
];
