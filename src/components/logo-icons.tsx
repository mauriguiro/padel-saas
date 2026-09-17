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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Racket hitting the ball, angled */}
    <g transform="rotate(45, 12, 12)">
      {/* Handle */}
      <rect x="10.5" y="16" width="3" height="6" rx="1" />
      {/* Racket Head */}
      <path d="M12 2C8 2 6 6 6 10C6 14 9.5 16 12 16C14.5 16 18 14 18 10C18 6 16 2 12 2Z" />
      {/* Holes */}
      <circle cx="9.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="12" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="14.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="9.5" cy="10" r="0.5" fill="currentColor" />
      <circle cx="12" cy="10" r="0.5" fill="currentColor" />
      <circle cx="14.5" cy="10" r="0.5" fill="currentColor" />
      <circle cx="10.7" cy="12.5" r="0.5" fill="currentColor" />
      <circle cx="13.3" cy="12.5" r="0.5" fill="currentColor" />
    </g>
    {/* Ball and motion lines */}
    <circle cx="20" cy="4" r="1.5" fill="currentColor" />
    <path d="M15 9 L18 6" strokeDasharray="2 2" />
    <path d="M13 11 L19 5" strokeDasharray="2 2" />
  </svg>
)
