export function HAMCSLogo({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brain shape - left and right hemispheres */}
      <g>
        {/* Left hemisphere */}
        <path
          d="M 25 35 Q 20 40 20 50 Q 20 65 30 70 Q 35 72 40 70 Q 38 60 40 50 Q 38 40 35 35"
          fill="currentColor"
          opacity="0.8"
        />
        
        {/* Right hemisphere */}
        <path
          d="M 75 35 Q 80 40 80 50 Q 80 65 70 70 Q 65 72 60 70 Q 62 60 60 50 Q 62 40 65 35"
          fill="currentColor"
          opacity="0.8"
        />
        
        {/* Center connection - representing continuity/memory */}
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.9" />
        
        {/* Neural connections */}
        <line x1="40" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        <line x1="60" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        
        {/* Top connections - thought pathways */}
        <path d="M 35 40 Q 45 30 55 40" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        
        {/* Bottom connections - memory continuity */}
        <path d="M 35 60 Q 45 70 55 60" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      </g>
      
      {/* Circular arrow for continuity - outer ring */}
      <g opacity="0.5">
        <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" fill="none" />
        <path
          d="M 88 50 L 92 50 L 90 45"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
