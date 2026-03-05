export function IslamicLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer decorative circle */}
      <circle 
        cx="60" 
        cy="60" 
        r="55" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.2"
      />
      
      {/* Islamic geometric pattern - 8-pointed star base */}
      <g opacity="0.15">
        <path d="M60 20 L65 50 L95 45 L70 60 L95 75 L65 70 L60 100 L55 70 L25 75 L50 60 L25 45 L55 50 Z" 
          stroke="currentColor" 
          strokeWidth="0.5" 
          fill="none"
        />
      </g>
      
      {/* Crescent Moon - more refined shape */}
      <path
        d="M 45 30 
           Q 30 40, 30 60 
           Q 30 80, 45 90
           Q 38 85, 38 60
           Q 38 35, 45 30 Z"
        fill="currentColor"
        opacity="0.95"
      />
      
      {/* Five-pointed Star - Islamic symbol */}
      <g transform="translate(75, 40)">
        <path
          d="M 0 -8 
             L 2.4 -2.4 
             L 8.5 -1.5 
             L 3.5 2.5 
             L 4.5 8.5 
             L 0 5 
             L -4.5 8.5 
             L -3.5 2.5 
             L -8.5 -1.5 
             L -2.4 -2.4 Z"
          fill="currentColor"
        />
      </g>
      
      {/* Open book at bottom */}
      <g transform="translate(60, 85)">
        {/* Left page */}
        <path
          d="M -15 -8 L -15 8 Q -10 10, 0 10 L 0 -8 Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* Right page */}
        <path
          d="M 0 -8 L 0 10 Q 10 10, 15 8 L 15 -8 Z"
          fill="currentColor"
          opacity="0.9"
        />
        {/* Book lines */}
        <line x1="-12" y1="-4" x2="-3" y2="-4" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="-12" y1="0" x2="-3" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="-12" y1="4" x2="-3" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="3" y1="-4" x2="12" y2="-4" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="3" y1="0" x2="12" y2="0" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="3" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </g>
      
      {/* Decorative dots in Islamic pattern style */}
      <circle cx="30" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="90" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="30" cy="90" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="90" cy="90" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}
