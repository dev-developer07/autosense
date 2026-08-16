import { HeroMap } from "./HeroMap";

export function Hero() {
  return (
    <section id="top" className="bg-background">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-10 lg:py-24">
        <div className="animate-rise">
          <span className="label-caps">Environment-aware navigation</span>
          <h1 className="mt-4 font-display text-[42px] font-bold leading-[0.98] tracking-[-0.03em] text-foreground sm:text-[56px] lg:text-[68px] xl:text-[76px]">
            THE ROAD ISN&apos;T JUST A ROUTE.
          </h1>
          <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-muted-foreground sm:text-[18px]">
            AutoSense helps you understand air quality at your destination and find routes with
            lower pollution exposure.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#safest-route"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[6px] bg-primary px-6 text-[16px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Find a Cleaner Route <span aria-hidden>→</span>
            </a>
            <a
              href="#aqi-map"
              className="inline-flex h-12 items-center justify-center rounded-[6px] border border-border bg-card px-6 text-[16px] font-medium text-foreground transition-colors hover:bg-muted"
            >
              Check Air Quality
            </a>
          </div>
        </div>

        <div className="animate-rise" style={{ animationDelay: "0.1s" }}>
          <HeroMap />
        </div>
      </div>
    </section>
  );
}
