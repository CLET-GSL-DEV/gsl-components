import { forwardRef, useMemo, useState } from "react";
import type { HeroBannerProps } from "../../types/hero-banner";
import { cn } from "../../utils/cn";
import hero1 from "./assets/hero-1.jpg";
import hero2 from "./assets/hero-2.jpg";
import hero3 from "./assets/hero-3.jpg";
import hero4 from "./assets/hero-4.jpg";
import hero5 from "./assets/hero-5.jpg";
import hero6 from "./assets/hero-6.jpg";
import hero7 from "./assets/hero-7.jpg";
import hero8 from "./assets/hero-8.jpg";
import "./styles/hero-banner.css";
import { CalendarIcon } from "lucide-react";

const DEFAULT_IMAGES = [
  { src: hero1, alt: "clet futuristic artwork" },
  { src: hero2, alt: "clet futuristic artwork" },
  { src: hero3, alt: "clet futuristic artwork" },
  { src: hero4, alt: "clet futuristic artwork" },
  { src: hero5, alt: "clet futuristic artwork" },
  { src: hero6, alt: "clet futuristic artwork" },
  { src: hero7, alt: "clet futuristic artwork" },
  { src: hero8, alt: "clet futuristic artwork" },
];

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Edge-to-edge dashboard hero: greeting, name, optional role, current
 * date, and preset artwork selected by variant index.
 * All text is props; the date defaults to today; images are presets.
 */
export const HeroBanner = forwardRef<HTMLElement, HeroBannerProps>(
  function HeroBanner(
    {
      greeting = "Good morning,",
      name,
      role,
      date,
      images = DEFAULT_IMAGES,
      imageVariant: controlledVariant,
      defaultImageVariant = 0,
      classNames,
      className,
      ...props
    },
    ref,
  ) {
    const [uncontrolledVariant] = useState(defaultImageVariant);
    const activeIndex = controlledVariant ?? uncontrolledVariant;

    const safeIndex = useMemo(() => {
      if (images.length === 0) return 0;
      return Math.min(Math.max(activeIndex, 0), images.length - 1);
    }, [activeIndex, images.length]);

    const activeImage = images[safeIndex];

    return (
      <section
        ref={ref}
        className={cn("clet-hero-banner", classNames?.root, className)}
        {...props}
      >
        {activeImage ? (
          <img
            className={cn("clet-hero-banner__image", classNames?.image)}
            src={activeImage.src}
            alt={activeImage.alt ?? ""}
            aria-hidden={activeImage.alt ? undefined : true}
          />
        ) : null}
        <div className="clet-hero-banner__scrim" aria-hidden />
        <div className={cn("clet-hero-banner__content", classNames?.content)}>
          <div className={cn("clet-hero-banner__text", classNames?.text)}>
            <div>
              <div
                className={cn(
                  "clet-hero-banner__greeting",
                  classNames?.greeting,
                )}
              >
                {greeting}
              </div>

              <div className={cn("clet-hero-banner__name", classNames?.name)}>
                {name}
              </div>
              {role ? (
                <div className={cn("clet-hero-banner__role", classNames?.role)}>
                  {role}
                </div>
              ) : null}
            </div>
            <div className={cn("clet-hero-banner__date", classNames?.date)}>
              <CalendarIcon size={16} className="clet-hero-banner__date-icon" />
              {date ?? todayLabel()}
            </div>
          </div>
        </div>
      </section>
    );
  },
);
