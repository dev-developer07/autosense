export function FinalCta() {
  return (
    <section className="border-t border-border bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1400px] px-5 text-center lg:px-10">
        <h2 className="mx-auto max-w-[900px] font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[46px] lg:text-[56px]">
          YOUR ROUTE. YOUR AIR. YOUR CHOICE.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-muted-foreground">
          Check the air. Compare the route. Make a better-informed journey.
        </p>
        <a
          href="#aqi-map"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[6px] bg-primary px-6 text-[16px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Launch AutoSense <span aria-hidden>→</span>
        </a>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1400px] flex-col gap-2 border-t border-border px-5 pt-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span>AutoSense · Environment-aware navigation</span>
        <span>Maps &amp; routing: Google Maps Platform · Air quality: Google Air Quality API</span>
      </div>
    </section>
  );
}
