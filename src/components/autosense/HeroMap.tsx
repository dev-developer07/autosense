/** Static, illustrative map panel used in the hero. Values are sample data. */
export function HeroMap() {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_rgba(16,24,23,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="label-caps">Route preview</span>
        <span className="rounded-[4px] border border-border px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
          SAMPLE DATA
        </span>
      </div>

      <div className="relative aspect-[4/3] w-full bg-[#eef2f0] sm:aspect-[16/11]">
        <svg viewBox="0 0 640 440" className="h-full w-full" role="img" aria-label="Illustrative map showing two routes between an origin and a destination">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#dce3e0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="640" height="440" fill="#f1f4f3" />
          <rect width="640" height="440" fill="url(#grid)" />
          {/* blocks */}
          <g fill="#e6ebe9">
            <rect x="60" y="60" width="120" height="90" rx="3" />
            <rect x="230" y="40" width="150" height="70" rx="3" />
            <rect x="430" y="90" width="140" height="110" rx="3" />
            <rect x="80" y="240" width="130" height="120" rx="3" />
            <rect x="270" y="270" width="110" height="90" rx="3" />
            <rect x="450" y="290" width="130" height="80" rx="3" />
          </g>
          {/* water */}
          <path d="M0 400 C120 380 200 420 320 400 C440 380 540 420 640 400 L640 440 L0 440Z" fill="#e2eceb" />

          {/* fastest route */}
          <path
            d="M110 340 C180 300 200 220 280 200 C360 180 420 150 520 120"
            fill="none"
            stroke="#101817"
            strokeWidth="5"
            strokeLinecap="round"
            strokeOpacity="0.65"
            className="route-draw"
          />
          {/* autosense route */}
          <path
            d="M110 340 C160 380 260 350 330 300 C400 250 430 160 520 120"
            fill="none"
            stroke="#16b8a6"
            strokeWidth="5"
            strokeLinecap="round"
            className="route-draw"
            style={{ animationDelay: "0.25s" }}
          />

          {/* AQI markers */}
          <g fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600">
            <circle cx="280" cy="200" r="16" fill="#e7b84b" stroke="#ffffff" strokeWidth="3" />
            <text x="280" y="205" textAnchor="middle" fill="#101817">86</text>
            <circle cx="440" cy="152" r="16" fill="#e77b3c" stroke="#ffffff" strokeWidth="3" />
            <text x="440" y="157" textAnchor="middle" fill="#ffffff">128</text>
            <circle cx="330" cy="300" r="16" fill="#3fa66b" stroke="#ffffff" strokeWidth="3" />
            <text x="330" y="305" textAnchor="middle" fill="#ffffff">42</text>
          </g>

          {/* origin + destination */}
          <circle cx="110" cy="340" r="9" fill="#101817" stroke="#ffffff" strokeWidth="3" />
          <g>
            <circle cx="520" cy="120" r="9" fill="#19a974" stroke="#ffffff" strokeWidth="3" />
            <circle cx="520" cy="120" r="18" fill="none" stroke="#19a974" strokeOpacity="0.35" strokeWidth="2" />
          </g>
        </svg>

        <div className="animate-rise absolute left-4 top-4 w-[168px] rounded-[8px] border border-border bg-card p-3">
          <div className="label-caps">Destination AQI</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[32px] font-bold leading-none text-foreground">42</span>
            <span className="text-[12px] font-semibold tracking-[0.12em]" style={{ color: "var(--aqi-good)" }}>
              GOOD
            </span>
          </div>
        </div>

        <div
          className="animate-rise absolute bottom-4 left-4 right-4 rounded-[8px] border border-border bg-card p-3 sm:left-auto sm:w-[220px]"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="flex items-center justify-between">
            <span className="label-caps">AutoSense route</span>
            <span
              className="rounded-[4px] px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-white"
              style={{ backgroundColor: "var(--teal)" }}
            >
              RECOMMENDED
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-[15px] font-medium text-foreground">
            <span>18 min</span>
            <span className="text-border">|</span>
            <span>7.4 km</span>
          </div>
          <div className="mt-1 text-[13px] font-medium" style={{ color: "var(--primary)" }}>
            Estimated exposure ↓ 31%
          </div>
        </div>
      </div>
    </div>
  );
}
