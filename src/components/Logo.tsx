export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id="zenithGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#d35400', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#e67e22', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="20" fill="#1a1a1a" />
      <path d="M 25 30 L 75 30 L 35 70 L 75 70" fill="none" stroke="url(#zenithGrad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
