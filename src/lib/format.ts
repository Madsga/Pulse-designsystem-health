export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-US');

/** 0.712 → "71%" */
export const percent = (v: number) => `${Math.round(v * 100)}%`;

/** 0.7123 → "71.2%" */
export const percentOneDecimal = (v: number) => `${(Math.round(v * 1000) / 10).toFixed(1)}%`;
