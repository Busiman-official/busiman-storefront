"use client";

/**
 * Focal-point picker shown right after choosing a hero background image (or via "Reposition" on
 * one already set) — drag or click anywhere on the preview to choose which part of the photo stays
 * visible once it's cropped to fill the hero banner. Not a fixed 3x3 grid of positions: the pin
 * follows the pointer continuously and lands wherever it's released, which is what "draggable
 * position, can be anywhere" actually means — a real X/Y percentage pair (see heroImagePositionX/Y
 * on the model), not a snap-to-preset picker.
 *
 * The preview box uses a fixed wide-banner aspect ratio as a stand-in for the real hero section,
 * which has no fixed height of its own (it's sized by its text content) — close enough to judge
 * framing by, with a line saying so underneath so it's not mistaken for an exact crop preview.
 */
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

export interface ImagePosition {
  x: number;
  y: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function ImagePositionModal({
  imageUrl,
  initialPosition,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  imageUrl: string;
  initialPosition: ImagePosition;
  /** True while the parent is uploading/saving — keeps the modal open with a disabled confirm
   * button rather than closing optimistically, since an upload can still fail. */
  busy: boolean;
  error: string | null;
  onConfirm: (position: ImagePosition) => void;
  onCancel: () => void;
}) {
  const [position, setPosition] = useState<ImagePosition>(initialPosition);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const positionFromPointer = (e: ReactPointerEvent<HTMLDivElement>): ImagePosition | null => {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    return { x, y };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const next = positionFromPointer(e);
    if (!next) return;
    setPosition(next);
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const next = positionFromPointer(e);
    if (next) setPosition(next);
  };

  const handlePointerUp = () => setDragging(false);

  // Rendered via a portal straight onto <body> — the admin sidebar that hosts this component is
  // itself inside a `position: sticky` wrapper (AdminShell.tsx), and sticky elements establish
  // their own stacking context, so a plain `fixed z-70` nested inside it only outranks OTHER
  // content inside that same sidebar — the live preview column next to it (painted later in DOM
  // order) would still draw over this modal and swallow clicks on it. A portal escapes that
  // trapped context entirely.
  return createPortal(
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-sf-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-sf-line px-5 py-4">
          <h2 className="font-heading text-base font-semibold text-sf-ink">Position your hero image</h2>
          <button aria-label="Cancel" className="cursor-pointer rounded-full p-1 text-sf-ink-soft hover:bg-sf-bg hover:text-sf-ink" onClick={onCancel} type="button">
            <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 px-5 py-5">
          <div
            className="relative aspect-21/9 w-full touch-none select-none overflow-hidden rounded-lg border border-sf-line"
            id="hero-image-position-frame"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={frameRef}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="pointer-events-none h-full w-full object-cover"
              draggable={false}
              src={imageUrl}
              style={{ objectPosition: `${position.x}% ${position.y}%` }}
            />
            <div
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sf-ink/70 shadow-md"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            />
          </div>
          <p className="text-xs text-sf-ink-soft">
            Drag or click anywhere on the photo to choose what stays in view. The hero banner's actual height follows your heading and description text, so this is a close preview, not an exact crop.
          </p>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-sf-line px-5 py-4">
          <button
            className="cursor-pointer rounded-full border border-sf-line px-4 py-1.5 text-xs font-semibold text-sf-ink disabled:opacity-50"
            disabled={busy}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="cursor-pointer rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => onConfirm(position)}
            type="button"
          >
            {busy ? "Saving…" : "Use this image"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
