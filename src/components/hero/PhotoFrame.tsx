"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { photos } from "@/content/photos";
import { Lightbox } from "./Lightbox";

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
        className="group relative block w-full max-w-[300px] rotate-[-1.4deg] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.015]"
      >
        <div className="relative border border-rule bg-raised p-2">
          <Image
            src={cover.src}
            alt={cover.alt}
            width={880}
            height={1100}
            priority
            sizes="(max-width: 768px) 60vw, 300px"
            className="w-full h-auto"
          />
        </div>

        {/* Sits on the frame edge rather than over the image — nothing
            obscures the photo itself. */}
        <span className="absolute -bottom-3 left-4 bg-ground px-2 chrome text-ink-dim transition-colors duration-300 group-hover:text-accent">
          {photos.length} photos
        </span>
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
