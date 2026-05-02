export const RuloPassLogo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dış Rulo Çerçevesi */}
    <rect 
      x="5" y="30" width="90" height="40" rx="20" 
      className="stroke-white/10" 
      strokeWidth="1" 
    />
    
    {/* Ana Akış Grubu (R + Pass Oku) */}
    <g>
      {/* R Harfi ve Ok Formu */}
      <path 
        d="M25 35V65M25 35H45C52 35 52 48 45 48H25M42 48L55 65H75L60 48L75 48L85 50L75 52" 
        stroke="url(#logoGradient)" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Hız Çizgileri */}
      <path d="M10 45H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/30" />
      <path d="M7 55H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/30" />
    </g>
    
    <defs>
      <linearGradient id="logoGradient" x1="25" y1="35" x2="85" y2="65" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);
