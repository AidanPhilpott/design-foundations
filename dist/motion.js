// design-foundations motion helpers. Dependency-free ESM; honours Reduce Motion live.
// The TOKENS placeholder below is replaced by `design-foundations build` with the resolved tokens.

const deepFreeze = (o) => {
  if (o && typeof o === 'object') {
    Object.values(o).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
};

const TOKENS = deepFreeze({
  "durations": {
    "instant": 0,
    "micro": 100,
    "short": 200,
    "medium": 300,
    "long": 500,
    "cameraNear": 500,
    "cameraFar": 800
  },
  "transitions": {
    "push": {
      "normal": {
        "duration": 300,
        "easing": "linear(0, 0.024, 0.0823, 0.1595, 0.2449, 0.3316, 0.4154, 0.4935, 0.5647, 0.6284, 0.6846, 0.7336, 0.776, 0.8123, 0.8433, 0.8695, 0.8917, 0.9103, 0.9259, 0.9389, 0.9497, 0.9587, 0.9661, 0.9722, 0.9773, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1)",
        "properties": [
          "transform",
          "opacity"
        ],
        "distance": 28
      },
      "reduced": {
        "duration": 200,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "opacity"
        ]
      }
    },
    "pop": {
      "normal": {
        "duration": 300,
        "easing": "linear(0, 0.024, 0.0823, 0.1595, 0.2449, 0.3316, 0.4154, 0.4935, 0.5647, 0.6284, 0.6846, 0.7336, 0.776, 0.8123, 0.8433, 0.8695, 0.8917, 0.9103, 0.9259, 0.9389, 0.9497, 0.9587, 0.9661, 0.9722, 0.9773, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1)",
        "properties": [
          "transform",
          "opacity"
        ],
        "distance": 28
      },
      "reduced": {
        "duration": 200,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "opacity"
        ]
      }
    },
    "rise": {
      "normal": {
        "duration": 300,
        "easing": "cubic-bezier(0, 0, 0.2, 1)",
        "properties": [
          "transform",
          "opacity"
        ],
        "distance": 16
      },
      "reduced": {
        "duration": 200,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "opacity"
        ]
      }
    },
    "sheet": {
      "normal": {
        "duration": 500,
        "easing": "linear(0, 0.024, 0.0823, 0.1595, 0.2449, 0.3316, 0.4154, 0.4935, 0.5647, 0.6284, 0.6846, 0.7336, 0.776, 0.8123, 0.8433, 0.8695, 0.8917, 0.9103, 0.9259, 0.9389, 0.9497, 0.9587, 0.9661, 0.9722, 0.9773, 0.9814, 0.9848, 0.9876, 0.9899, 0.9918, 0.9933, 0.9946, 0.9956, 0.9964, 0.9971, 0.9977, 0.9981, 0.9985, 0.9988, 1)",
        "properties": [
          "transform"
        ]
      },
      "reduced": {
        "duration": 200,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "transform"
        ]
      }
    },
    "feedback": {
      "normal": {
        "duration": 100,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "background-color",
          "color",
          "transform"
        ]
      },
      "reduced": {
        "duration": 100,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "background-color",
          "color"
        ]
      }
    },
    "camera": {
      "normal": {
        "duration": 500,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "camera"
        ]
      },
      "reduced": {
        "duration": 0,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "camera"
        ]
      }
    },
    "loop": {
      "normal": {
        "duration": 500,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": [
          "opacity"
        ]
      },
      "reduced": {
        "duration": 0,
        "easing": "cubic-bezier(0.4, 0, 0.2, 1)",
        "properties": []
      }
    }
  }
});

const QUERY = '(prefers-reduced-motion: reduce)';
const mql = () => (typeof globalThis.matchMedia === 'function' ? globalThis.matchMedia(QUERY) : null);

/** True when the user asked for reduced motion. Read live; false where matchMedia is missing. */
export function prefersReducedMotion() {
  const q = mql();
  return Boolean(q && q.matches);
}

/** Calls cb(reduced: boolean) whenever the setting changes. Returns an unsubscribe function. */
export function onReducedMotionChange(cb) {
  const q = mql();
  if (!q) return () => {};
  const handler = (e) => cb(Boolean(e.matches));
  if (q.addEventListener) {
    q.addEventListener('change', handler);
    return () => q.removeEventListener('change', handler);
  }
  q.addListener?.(handler);
  return () => q.removeListener?.(handler);
}

/** Duration in ms. Camera durations are 0 under Reduce Motion. */
export function duration(name) {
  const ms = TOKENS.durations[name];
  if (ms === undefined) throw new Error(`unknown duration: ${name}`);
  return prefersReducedMotion() && name.startsWith('camera') ? 0 : ms;
}

const pick = (name) => {
  const t = TOKENS.transitions[name];
  if (!t) throw new Error(`unknown transition: ${name}`);
  return prefersReducedMotion() ? t.reduced : t.normal;
};

/** {duration (ms), easing (CSS), properties, distance?} for the current Reduce Motion setting. */
export function transition(name) {
  const { properties, ...rest } = pick(name);
  return { ...rest, properties: [...properties] };
}

/** Move a Leaflet-compatible map. Point or bounds target; instant under Reduce Motion. */
export function camera(map, target, { zoom, far = false, ...opts } = {}) {
  const isBounds = typeof target?.getNorthEast === 'function';
  if (prefersReducedMotion()) {
    if (isBounds) return map.fitBounds(target, { ...opts, animate: false });
    return map.setView(target, zoom, { ...opts, animate: false });
  }
  const seconds = TOKENS.durations[far ? 'cameraFar' : 'cameraNear'] / 1000;
  if (isBounds) return map.flyToBounds(target, { ...opts, duration: seconds });
  return map.flyTo(target, zoom, { ...opts, duration: seconds });
}

/** Scroll an element to its top; smooth only when motion is allowed. */
export function scrollToTop(el) {
  if (typeof el.scrollTo === 'function') el.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  else el.scrollTop = 0;
}

const DEFAULT_KEYFRAMES = {
  push: [{ transform: 'translateX(28px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
  pop: [{ transform: 'translateX(-28px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }],
  rise: [{ transform: 'translateY(16px)', opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }],
};

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const META = new Set(['offset', 'easing', 'composite']);
const keep = (key, props) => META.has(key) || props.includes(kebab(key));

function restrict(keyframes, props) {
  if (Array.isArray(keyframes)) {
    return keyframes
      .map((f) => Object.fromEntries(Object.entries(f).filter(([k]) => keep(k, props))))
      .filter((f) => Object.keys(f).some((k) => !META.has(k)));
  }
  const kept = Object.entries(keyframes).filter(([k]) => keep(k, props));
  return kept.some(([k]) => !META.has(k)) ? Object.fromEntries(kept) : [];
}

const lastFrame = (keyframes) => {
  const all = Array.isArray(keyframes)
    ? Object.assign({}, ...keyframes)
    : Object.fromEntries(Object.entries(keyframes).map(([k, v]) => [k, Array.isArray(v) ? v.at(-1) : v]));
  return Object.fromEntries(Object.entries(all).filter(([k]) => !META.has(k)));
};

const running = new WeakMap();

/**
 * Web Animations wrapper. Cancels the element's previous animation. Under Reduce Motion only the
 * transition's reduced properties animate; if none remain, the end state is applied and null returned.
 * push/pop/rise have default keyframes; other names need explicit keyframes (else null).
 */
export function animate(el, name, keyframes = DEFAULT_KEYFRAMES[name]) {
  running.get(el)?.cancel();
  running.delete(el);
  if (!keyframes) return null;
  const t = pick(name);
  const frames = prefersReducedMotion() ? restrict(keyframes, t.properties) : keyframes;
  const empty = Array.isArray(frames) ? frames.length === 0 : Object.keys(frames).length === 0;
  if (empty || typeof el.animate !== 'function') {
    Object.assign(el.style, lastFrame(keyframes));
    return null;
  }
  const anim = el.animate(frames, { duration: t.duration, easing: t.easing, fill: 'both' });
  running.set(el, anim);
  return anim;
}
