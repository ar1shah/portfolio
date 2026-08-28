"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { photos } from "@/content/photos";
import { Lightbox } from "./Lightbox";

const TICK = "pointer-events-none absolute h-2.5 w-2.5 border-rule transition-colors duration-300 group-hover:border-accent";

function CornerTicks() {
  return (
    <>
      <span aria-hidden className={`${TICK} left-0 top-0 border-l border-t`} />
      <span aria-hidden className={`${TICK} right-0 top-0 border-r border-t`} />
      <span aria-hidden className={`${TICK} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${TICK} bottom-0 right-0 border-b border-r`} />
    </>
  );
}

export function PhotoFrame() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    // Send focus back where it came from, or the keyboard user is dropped
    // at the top of the document.
    triggerRef.current?.focus();
  }

  const cover = photos[0];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-label={`Open photos — ${photos.length} images`}
        className="group relative block w-full max-w-[300px] border border-rule bg-raised transition-[transform,border-color] duration-300 hover:scale-[1.01] hover:border-accent"
      >
        <div className="flex items-center justify-between border-b border-rule px-3 py-2 transition-colors duration-300 group-hover:border-accent">
          <span className="chrome text-ink-dim">~/photos</span>
          <span className="chrome text-ink-dim">
            {String(photos.length).padStart(2, "0")} files
          </span>
        </div>

        <div className="relative p-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-ground">
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="(max-width: 768px) 60vw, 300px"
              className="object-cover"
            />
            <span aria-hidden className="scanlines pointer-events-none absolute inset-0" />
          </div>
          <CornerTicks />
        </div>
      </button>

      {open && (
        <Lightbox
          photos={photos}
          index={index}
          onIndexChange={setIndex}
          onClose={close}
        />
      )}
    </>
  );
}
