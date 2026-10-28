"use client";

/**
 * Hero's "Carousel" design — rotates through several background photos, each with its own
 * optional heading/description/button that overrides the store's shared ones (storeName/aboutText/
 * heroCtaText/heroCtaUrl), independently hideable so a slide can be pure background photo. This
 * component owns everything in the hero banner for the Carousel design — backgrounds, controls, AND
 * the text layered on top (which now changes per active slide) — unlike Classic, where
 * ClassicTemplate.tsx itself still layers one static click-to-edit heading/description/button on
 * top of a single image. Per-slide text here is edited through the sidebar's own "Slide N" detail
 * panel (SectionSidebar.tsx), not inline click-to-edit — EditableText is wired to one siteDetails
 * field, not an array index, so it can't address "this slide's heading" the way it addresses
 * storeName; a sidebar form is the natural fit for a value that's one of up to five.
 */
import { useEffect, useRef, useState } from "react";

export interface HeroCarouselSlide {
  image: string;
  positionX?: number;
  positionY?: number;
  heading?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  /** undefined means "on" — same convention as trustStripEnabled etc. A slide can still have text
   * set but hidden (e.g. a merchant tried a caption, didn't like it, toggled it off without having
   * to delete what they typed). */
  showHeading?: boolean;
  showDescription?: boolean;
  showCta?: boolean;
}

const SWIPE_THRESHOLD_PX = 40;

export function HeroCarousel({
  slides,
  autoplayMs,
  accent,
  defaultHeading,
  defaultDescription,
  defaultCtaText,
  defaultCtaUrl,
}: {
  slides: HeroCarouselSlide[];
  autoplayMs?: number;
  accent: string;
  /** Fallbacks used when a slide hasn't set its own override — the shared storeName/aboutText/
   * heroCtaText/heroCtaUrl, so a carousel built before per-slide text existed keeps rendering
   * exactly as it did before this feature shipped. */
  defaultHeading: string;
  defaultDescription?: string;
  defaultCtaText?: string;
  defaultCtaUrl?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStartX = useRef<number | null>(null);
  const count = slides.length;

  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (paused || !autoplayMs || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, count, paused]);

  const goTo = (next: number) => setIndex(((next % count) + count) % count);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current == null) return;
    const delta = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    goTo(index + (delta < 0 ? 1 : -1));
  };

  if (count === 0) return null;

  const active = slides[index] ?? slides[0];
  const showHeading = active.showHeading !== false;
  const showDescription = active.showDescription !== false;
  const showCta = active.showCta !== false;
  const heading = active.heading || defaultHeading;
  const description = active.description || defaultDescription;
  const ctaText = active.ctaText || defaultCtaText || "Shop now";
  const ctaUrl = active.ctaUrl || defaultCtaUrl || "#catalog";
  const hasAnyText = (showHeading && heading) || (showDescription && description) || showCta;

  return (
    <div
      className="absolute inset-0"
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerCancel={() => (pointerStartX.current = null)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {slides.map((slide, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none ${i === index ? "opacity-100" : "opacity-0"}`}
          draggable={false}
          key={slide.image + i}
          src={slide.image}
          style={{ objectPosition: `${slide.positionX ?? 50}% ${slide.positionY ?? 50}%` }}
        />
      ))}
      <div className="absolute inset-0 bg-black/45" />

      {/* NOT absolutely positioned, unlike the images above — this is the one normal-flow element
          inside the hero section (same technique Classic's single-image mode already used, just
          moved here), and it's what actually gives the section its height, since the section itself
          has no explicit height of its own (only py-14/py-20 padding — see ClassicTemplate.tsx). An
          empty slide (every field hidden/unset) still needs SOME flow content to hold the section's
          height, hence the invisible spacer in that branch below. */}
      {hasAnyText ? (
        <div className="relative z-10 mx-auto max-w-2xl space-y-5 text-center text-white">
          {showHeading && heading ? <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{heading}</h1> : null}
          {showDescription && description ? <p className="text-sm text-white/90 sm:text-base">{description}</p> : null}
          {showCta ? (
            <a
              className="inline-block cursor-pointer rounded-full px-6 py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-110"
              href={ctaUrl}
              style={{ backgroundColor: accent }}
            >
              {ctaText}
            </a>
          ) : null}
        </div>
      ) : (
        <div aria-hidden="true" className="relative z-10 h-8 sm:h-10" />
      )}

      {count > 1 ? (
        <>
          <button
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-sf-ink shadow-sm transition-colors hover:bg-white"
            onClick={() => goTo(index - 1)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-sf-ink shadow-sm transition-colors hover:bg-white"
            onClick={() => goTo(index + 1)}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {slides.map((slide, i) => (
              <button
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 cursor-pointer rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/75"}`}
                key={slide.image + i}
                onClick={() => goTo(i)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
