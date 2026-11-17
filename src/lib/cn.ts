import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom font sizes from index.css, so `text-meta`
// is treated as a size and not mistaken for a text colour.
const twMerge = extendTailwindMerge({
  extend: { theme: { text: ['meta', 'micro'] } },
});

/** Join class names; later Tailwind classes override earlier conflicting ones. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
