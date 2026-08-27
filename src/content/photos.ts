export type Photo = {
  src: string;
  alt: string;
  caption: string;
};

/**
 * Drop real files into /public/photos and swap the `src` values.
 * Nothing else needs to change — the frame and lightbox read from here.
 * Portrait-ish sources look best; the frame is 4:5.
 */
export const photos: Photo[] = [
  {
    src: "/photos/placeholder-01.svg",
    alt: "Portrait of Ari Shah",
    caption: "me :)",
  },
  {
    src: "/photos/placeholder-02.svg",
    alt: "Placeholder",
    caption: "replace me",
  },
  {
    src: "/photos/placeholder-03.svg",
    alt: "Placeholder",
    caption: "replace me",
  },
];
