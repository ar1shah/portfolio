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
    src: "/photos/kitchen-laptop.png",
    alt: "Ari Shah working on a laptop at a kitchen table at night",
    caption: "late night shipping",
  },
  {
    src: "/photos/margarita.png",
    alt: "Ari Shah holding a margarita outdoors at dusk",
    caption: "off the clock",
  },
  {
    src: "/photos/chihuahua.png",
    alt: "A small chihuahua resting on a pillow",
    caption: "thats my dawg",
  },
];
