// Check registry entry point. Each check module self-registers when imported; later tasks add one import line here.
export { registerCheck, getChecks, checkIds } from './registry.mjs';
import './raw-values.mjs';
import './text-floor.mjs';
import './focus.mjs';
import './reduced-motion.mjs';
import './contrast.mjs';
import './icons.mjs';
import './targets.mjs';
import './grid.mjs';
