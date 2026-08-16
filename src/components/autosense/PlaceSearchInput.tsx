import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, MapPin, Search } from "lucide-react";
import { searchPlacesFn } from "@/lib/autosense.functions";
import type { PlaceResult } from "@/lib/autosense-types";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
  placeholder: string;
  icon?: "search" | "pin";
  ariaLabel: string;
};

export function PlaceSearchInput({
  value,
  onValueChange,
  onSelect,
  placeholder,
  icon = "search",
  ariaLabel,
}: Props) {
  const searchPlaces = useServerFn(searchPlacesFn);
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipRef = useRef(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces({ data: { query: value.trim() } });
        if (!cancelled) {
          setSuggestions(results);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 420);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, searchPlaces]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Icon = icon === "pin" ? MapPin : Search;

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-[6px] border border-border bg-card px-3 focus-within:border-primary">
        <Icon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
        <input
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="h-12 w-full bg-transparent text-[16px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full overflow-hidden rounded-[6px] border border-border bg-card shadow-[0_8px_24px_rgba(16,24,23,0.08)]">
          {suggestions.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  skipRef.current = true;
                  onValueChange(place.name);
                  setOpen(false);
                  setSuggestions([]);
                  onSelect(place);
                }}
                className="flex w-full items-start gap-2.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-muted"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.8} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium text-foreground">
                    {place.name}
                  </span>
                  <span className="block truncate text-[13px] text-muted-foreground">
                    {place.address}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
