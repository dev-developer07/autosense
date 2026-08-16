import { useState } from "react";
import { Menu, X, Radar } from "lucide-react";

const links = [
  { href: "#aqi-map", label: "AQI Map" },
  { href: "#safest-route", label: "Safest Route" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 lg:px-10">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-foreground">
            <Radar className="h-4 w-4 text-background" strokeWidth={2} />
          </span>
          <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
            AutoSense
          </span>
        </a>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#aqi-map"
            className="hidden items-center gap-1.5 rounded-[6px] bg-primary px-4 py-2 text-[15px] font-medium text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
          >
            Launch AutoSense <span aria-hidden>→</span>
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[6px] border border-border text-foreground md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-5 py-3 md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-[16px] font-medium text-foreground"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#aqi-map"
            onClick={() => setOpen(false)}
            className="mt-2 mb-1 flex items-center justify-center gap-1.5 rounded-[6px] bg-primary px-4 py-3 text-[16px] font-medium text-primary-foreground"
          >
            Launch AutoSense <span aria-hidden>→</span>
          </a>
        </div>
      )}
    </header>
  );
}
