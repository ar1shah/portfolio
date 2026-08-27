"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { Photo } from "@/content/photos";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

type Props = {
  photos: Photo[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
};

export function Lightbox({ photos, index, onIndexChange, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(true);

  const go = useCallback(
    (delta: number) => {
      onIndexChange((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onIndexChange],
  );

  // Move focus into the overlay on open so the keyboard lands somewhere useful.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }

      // Focus trap: cycle within the overlay rather than tabbing out to the
      // page behind it, which is still rendered.
      if (e.key === "Tab") {
        const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables?.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, onClose]);

  const photo = photos[index];
  const many = photos.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photos"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ground/92 p-4 sm:p-8"
      onMouseDown={(e) => {
        // mousedown, not click — a drag that starts on the image and ends on
        // the backdrop should not close the overlay.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-[440px] animate-rise"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center border border-rule text-ink-dim transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative border border-rule bg-raised">
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={880}
            height={1100}
            priority
            className="w-full h-auto"
          />

          {many && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-rule bg-ground/80 text-ink-dim transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15 18 9 12l6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center border border-rule bg-ground/80 text-ink-dim transition-colors duration-200 hover:border-accent hover:text-accent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="font-mono text-[12px] text-ink">{photo.caption}</p>
          {many && (
            <p className="chrome text-ink-dim shrink-0" aria-live="polite">
              {index + 1} / {photos.length}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
