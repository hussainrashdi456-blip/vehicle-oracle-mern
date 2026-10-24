export const formatPKR = (n) => `PKR ${Math.round(n).toLocaleString('en-PK')}`

// Pakistani convention: Lacs / Crore
export const formatLacs = (n) =>
  n >= 1e7 ? `${(n / 1e7).toFixed(2)} Crore` : `${(n / 1e5).toFixed(1)} Lacs`

// 15000 -> "15 000" (matches the reference design)
export const formatSpaced = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
