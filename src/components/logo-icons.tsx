export const PadelRacketLetterD = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Bowl of the 'd' (Teardrop shape pointing down-ish, handle on the right going up) */}
    <path d="M16 22V2" />
    <path d="M16 16C16 19.3137 13.3137 22 10 22C6.68629 22 4 19.3137 4 16C4 12.6863 7 10 10 10C13 10 16 12.6863 16 16Z" />
    {/* Padel Holes in the bowl */}
    <circle cx="8" cy="14" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="10" cy="16" r="0.75" fill="currentColor" stroke="none" />
    {/* Handle Grip Details */}
    <line x1="13" y1="4" x2="19" y2="4" />
    <line x1="13" y1="7" x2="19" y2="7" />
  </svg>
)

export const PadelRacketHit = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className={className}>
    <g transform="rotate(45, 12, 12)">
      {/* Handle / Overgrip */}
      <rect x="10.5" y="15" width="3" height="7" rx="1" fill="#f3f4f6" stroke="#4b5563" strokeWidth="0.5" />
      <path d="M10.5 17L13.5 16M10.5 19L13.5 18M10.5 21L13.5 20" stroke="#9ca3af" strokeWidth="0.5" />
      
      {/* Bridge (Heart of the racket) */}
      <path d="M9.5 15C9.5 15 12 11 14.5 15Z" fill="#ef4444" stroke="#dc2626" strokeWidth="0.5" />

      {/* Racket Head */}
      <path d="M12 1.5C7.5 1.5 5.5 6 5.5 10C5.5 14 9 15.5 12 15.5C15 15.5 18.5 14 18.5 10C18.5 6 16.5 1.5 12 1.5Z" fill="#1f2937" stroke="#111827" strokeWidth="0.5" />
      
      {/* Carbon fiber accent / design */}
      <path d="M12 1.5C9 1.5 7.5 6 7.5 10C7.5 13.5 10 15.5 12 15.5Z" fill="#374151" />
      
      {/* Holes */}
      <circle cx="9" cy="6" r="0.6" fill="#000" />
      <circle cx="12" cy="6" r="0.6" fill="#000" />
      <circle cx="15" cy="6" r="0.6" fill="#000" />
      <circle cx="8" cy="9" r="0.6" fill="#000" />
      <circle cx="12" cy="9" r="0.6" fill="#000" />
      <circle cx="16" cy="9" r="0.6" fill="#000" />
      <circle cx="9" cy="12" r="0.6" fill="#000" />
      <circle cx="12" cy="12" r="0.6" fill="#000" />
      <circle cx="15" cy="12" r="0.6" fill="#000" />
    </g>

    {/* Ball */}
    <circle cx="21" cy="3" r="2.5" fill="#ccff00" stroke="#9ca300" strokeWidth="0.5" />
    <path d="M19 2.5C20.5 2.5 21 4 21.5 4.5" stroke="#9ca300" fill="none" strokeWidth="0.5" />

    {/* Motion lines (Speed) */}
    <path d="M15 8 L18.5 4.5" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 3" />
    <path d="M13 11 L20 4" stroke="#9ca3af" strokeWidth="1" strokeLinecap="round" strokeDasharray="3 3" />
  </svg>
)
