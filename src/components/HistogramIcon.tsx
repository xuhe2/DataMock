type HistogramIconProps = {
  className?: string;
};

export function HistogramIcon({ className = "h-4 w-4" }: HistogramIconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={className} fill="none">
      <path d="M2 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 10.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 6.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.5 3.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.5 8.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
