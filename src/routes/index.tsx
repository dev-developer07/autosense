import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/autosense/Navbar";
import { Hero } from "@/components/autosense/Hero";
import { AqiSection } from "@/components/autosense/AqiSection";
import { RouteSection } from "@/components/autosense/RouteSection";
import { FinalCta } from "@/components/autosense/FinalCta";

const title = "AutoSense — Environment-aware navigation & AQI routing";
const description =
  "Check air quality at any location and compare the fastest route with a lower-pollution-exposure route on a live map.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <AqiSection />
        <RouteSection />
        <FinalCta />
      </main>
    </div>
  );
}
