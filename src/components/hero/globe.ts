/**
 * ASCII globe renderer — pure math, no React, no DOM.
 *
 * No mesh and no rasterizer here. A sphere can be intersected analytically,
 * so this walks the character grid once and asks "what is behind this cell":
 * inside the disc, the front surface point is z = sqrt(1 - x^2 - y^2).
 * Un-rotating that point gives a latitude and longitude to look up in the
 * land mask. One pass, no z-buffer, no overdraw.
 *
 * That is also why a globe survives this medium when a car did not — the
 * shape is defined by its silhouette, and the detail that makes it legible
 * (continent outlines) is high-contrast rather than shaded gradient.
 */
/** Monospace cells are taller than wide. */
const CHAR_ASPECT = 0.55;

/** Land shading, dark to bright. */
const RAMP = ".,-~:;=!*#$@";

/**
 * Land is confined to the bright end of the ramp. Letting it span the whole
 * range makes the globe read as a shaded ball with a gradient smeared over
 * it — the coastline shapes, which are the only reason a globe is legible
 * at this size, lose to the brightness falloff. Keeping land bright and
 * ocean faint puts the contrast on the shoreline where it belongs.
 */
const LAND_MIN = 5;
const LAND_MAX = RAMP.length - 2;

/** Floor on the day/night term, so the night side keeps its continents. */
const AMBIENT = 0.38;

/**
 * The accent is spent on exactly one thing: a pin at home, which rotates
 * out of view around the back like it should. Shading the brightest land
 * amber instead just scattered colour across whichever hemisphere happened
 * to be lit.
 */
const MARKER = { lat: 28.54, lon: -81.38, char: "@" } as const;

/** Ocean is drawn as a faint graticule rather than left empty. */
const OCEAN_CHAR = "·";
const GRATICULE_CHAR = ":";

/** Degrees between graticule lines. */
const GRATICULE_STEP = 30;
/** How close to a graticule line counts as on it, in degrees. */
const GRATICULE_WIDTH = 1.2;

/** Sun direction in view space — up and to the left, slightly toward us. */
const LIGHT = [-0.42, 0.40, 0.81] as const;

/** Fraction of the disc radius used, leaving a hair of margin. */
const FILL = 0.94;

export type Grid = { cols: number; rows: number };
export type Frame = { base: string; highlight: string };

export type EncodedLand = {
  lonCells: number;
  latCells: number;
  bits: string;
};

export type LandMask = {
  lonCells: number;
  latCells: number;
  bits: Uint8Array;
};

/**
 * Taken as an argument rather than imported so this module has no
 * dependencies at all — that is what lets it be driven headlessly by
 * scripts/globe-preview.mts. Decode once and cache.
 */
export function decodeLand(src: EncodedLand): LandMask {
  const bin = atob(src.bits);
  const bits = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bits[i] = bin.charCodeAt(i);
  return { lonCells: src.lonCells, latCells: src.latCells, bits };
}

function isLand(land: LandMask, lat: number, lon: number): boolean {
  // lat +90..-90 -> row 0..latCells-1 ; lon -180..180 -> col 0..lonCells-1
  let j = ((90 - lat) / 180) * land.latCells;
  let i = ((lon + 180) / 360) * land.lonCells;
  j = j < 0 ? 0 : j >= land.latCells ? land.latCells - 1 : j | 0;
  i = (((i | 0) % land.lonCells) + land.lonCells) % land.lonCells;
  const idx = j * land.lonCells + i;
  return (land.bits[idx >> 3] & (128 >> (idx & 7))) !== 0;
}

// Scratch buffers, reused so a 60fps loop allocates nothing.
let baseBuf: string[] = [];
let hiBuf: string[] = [];

/**
 * Renders one frame as two aligned layers: the globe, and a copy holding
 * only the brightest land cells. The component stacks them to get amber
 * highlights without emitting a DOM node per character.
 *
 * `spin` turns the globe about its polar axis; `tilt` leans the pole toward
 * or away from the viewer.
 */
export function renderGlobe(
  grid: Grid,
  spin: number,
  tilt: number,
  land: LandMask,
): Frame {
  const { cols, rows } = grid;

  // Radius in cells, on whichever axis binds first.
  const R = Math.min(cols / 2, rows / 2 / CHAR_ASPECT) * FILL;
  const cx = cols / 2;
  const cy = rows / 2;

  const cs = Math.cos(spin), ss = Math.sin(spin);
  const ct = Math.cos(tilt), st = Math.sin(tilt);

  if (baseBuf.length !== rows) {
    baseBuf = new Array(rows);
    hiBuf = new Array(rows);
  }

  for (let r = 0; r < rows; r++) {
    let base = "";
    let hi = "";

    // Cell centre, in units where the sphere has radius 1.
    const y = (cy - (r + 0.5)) / (R * CHAR_ASPECT);

    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5 - cx) / R;

      const d2 = x * x + y * y;
      if (d2 > 1) {
        base += " ";
        hi += " ";
        continue;
      }

      // Front surface of the unit sphere. For a unit sphere the surface
      // point and its normal are the same vector.
      const z = Math.sqrt(1 - d2);

      // Un-rotate into model space: undo the tilt about X, then the spin
      // about Y. This is the inverse of how the globe is posed.
      const y1 = y * ct + z * st;
      const z1 = -y * st + z * ct;
      const mx = x * cs - z1 * ss;
      const mz = x * ss + z1 * cs;
      const my = y1;

      const lat = Math.asin(Math.max(-1, Math.min(1, my))) * (180 / Math.PI);
      const lon = Math.atan2(mx, mz) * (180 / Math.PI);

      // Lambert shading against the sun, with a floor so the night side
      // stays visible as silhouette rather than dropping out entirely.
      const lambert = x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2];
      const lit = lambert < 0 ? 0 : lambert;

      if (isLand(land, lat, lon)) {
        const shade = AMBIENT + (1 - AMBIENT) * lit;
        base += RAMP[LAND_MIN + Math.round(shade * (LAND_MAX - LAND_MIN))];
        hi += " ";
        continue;
      }

      // Ocean: graticule lines where a meridian or parallel passes, a bare
      // stipple everywhere else. Gives the sphere its curvature without
      // competing with the continents.
      const nearLat =
        Math.abs(((lat + 900) % GRATICULE_STEP) - GRATICULE_STEP / 2) >
        GRATICULE_STEP / 2 - GRATICULE_WIDTH;
      // Meridians converge at the poles, so widen the tolerance with latitude.
      const lonTol = GRATICULE_WIDTH / Math.max(0.15, Math.cos((lat * Math.PI) / 180));
      const nearLon =
        Math.abs(((lon + 900) % GRATICULE_STEP) - GRATICULE_STEP / 2) >
        GRATICULE_STEP / 2 - lonTol;

      base += nearLat || nearLon ? GRATICULE_CHAR : OCEAN_CHAR;
      hi += " ";
    }

    baseBuf[r] = base;
    hiBuf[r] = hi;
  }

  // Place the home pin by projecting it directly rather than testing every
  // cell against it. This is the forward transform — the exact inverse of
  // the un-rotation above.
  const mlat = (MARKER.lat * Math.PI) / 180;
  const mlon = (MARKER.lon * Math.PI) / 180;
  const mx = Math.cos(mlat) * Math.sin(mlon);
  const my = Math.sin(mlat);
  const mz = Math.cos(mlat) * Math.cos(mlon);

  const px = mx * cs + mz * ss;
  const pz1 = -mx * ss + mz * cs;
  const py = my * ct - pz1 * st;
  const pz = my * st + pz1 * ct;

  // Behind the globe: the pin rotates out of sight, as it should.
  if (pz > 0) {
    const col = Math.round(cx + px * R - 0.5);
    const row = Math.round(cy - py * R * CHAR_ASPECT - 0.5);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      const line = hiBuf[row];
      hiBuf[row] = line.slice(0, col) + MARKER.char + line.slice(col + 1);
    }
  }

  return { base: baseBuf.join("\n"), highlight: hiBuf.join("\n") };
}
