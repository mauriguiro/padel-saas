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
  <img 
    src="/padel-icon.jpg" 
    alt="Logo Padel" 
    className={`${className} rounded-full object-cover`} 
  />
)
