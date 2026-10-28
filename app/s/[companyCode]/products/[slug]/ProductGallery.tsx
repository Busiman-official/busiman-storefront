"use client";

import Image from "next/image";
import { useState } from "react";
import type { StorefrontMediaItem } from "@/lib/api";

function PlayIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="22" viewBox="0 0 24 24" width="22">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function ProductGallery({ media, alt }: { media: StorefrontMediaItem[]; alt: string }) {
  const [active, setActive] = useState(0);
  const hasMedia = media.length > 0;
  const activeItem = media[active];

  return (
    <div className="space-y-2">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-sf-line bg-sf-surface">
        {!hasMedia ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-sf-ink-soft">No image</div>
        ) : activeItem.type === "video" ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- product demo clips have no captions to provide
          <video className="h-full w-full object-cover" controls playsInline src={activeItem.url} />
        ) : (
          <Image alt={alt} className="object-cover" fill priority sizes="(max-width: 640px) 100vw, 50vw" src={activeItem.url} />
        )}
      </div>
      {media.length > 1 ? (
        <div className="flex gap-2">
          {media.map((item, i) => (
            <button
              aria-label={item.type === "video" ? `Show video ${i + 1}` : `Show photo ${i + 1}`}
              aria-pressed={active === i}
              className="relative h-16 w-16 overflow-hidden rounded-md border"
              key={item.url}
              onClick={() => setActive(i)}
              style={{ borderColor: active === i ? "#1a1c1e" : "var(--sf-line)" }}
              type="button"
            >
              {item.type === "video" ? (
                <>
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption -- decorative thumbnail, not a playable instance */}
                  <video className="h-full w-full object-cover" muted playsInline src={item.url} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
                    <PlayIcon />
                  </span>
                </>
              ) : (
                <Image alt="" className="object-cover" fill sizes="64px" src={item.url} />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
