// design-foundations motion helpers. Dependency-free ESM; honours Reduce Motion live.
// The TOKENS placeholder below is replaced by `design-foundations build` with the resolved tokens.

const deepFreeze = (o) => {
  if (o && typeof o === 'object') {
    Object.values(o).forEach(deepFreeze);
    Object.freeze(o);
  }
  return o;
};

const TOKENS = deepFreeze(/*__DF_TOKENS__*/null);

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

// linear() easings (springs) throw in el.animate on browsers without CSS linear() (Safari < 17.2).
let linearOk;
const supportsLinear = () => {
  if (linearOk === undefined) {
    try {
      linearOk = typeof globalThis.CSS?.supports === 'function' ? globalThis.CSS.supports('transition-timing-function', 'linear(0, 1)') : true;
    } catch {
      linearOk = true;
    }
  }
  return linearOk;
};
const hasLinear = (easing) => /(?:^|[\s,])linear\(/.test(easing);
const safeEasing = (easing) => (hasLinear(easing) && !supportsLinear() ? TOKENS.fallbackEasing : easing);

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
  const opts = { duration: t.duration, easing: safeEasing(t.easing), fill: 'both' };
  let anim;
  try {
    anim = el.animate(frames, opts);
  } catch (e) {
    if (!hasLinear(opts.easing)) throw e;
    anim = el.animate(frames, { ...opts, easing: TOKENS.fallbackEasing });
  }
  running.set(el, anim);
  return anim;
}
