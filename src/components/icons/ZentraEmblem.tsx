export function ZentraEmblem({
  className = "h-5 w-5",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 8 radial petals like Zentra's emblem */}
      <g stroke="none" fill={color}>
        <circle cx="12" cy="3.5" r="2" />
        <circle cx="18" cy="6" r="2" />
        <circle cx="20.5" cy="12" r="2" />
        <circle cx="18" cy="18" r="2" />
        <circle cx="12" cy="20.5" r="2" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="3.5" cy="12" r="2" />
        <circle cx="6" cy="6" r="2" />
        <path
          d="M12 7V17M7 12H17M8.46 8.46L15.54 15.54M8.46 15.54L15.54 8.46"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
