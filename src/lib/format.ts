export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-US');

/** 0.712 → "71%" */
export const percent = (v: number) => `${Math.round(v * 100)}%`;

