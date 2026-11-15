import { Providers } from "@/components/motion/Providers";
import { Box } from "@/components/sections/Box";
import { FeatureExplorer } from "@/components/sections/FeatureExplorer";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { Masthead } from "@/components/sections/Masthead";
import { Pilot } from "@/components/sections/Pilot";
import { Principles } from "@/components/sections/Principles";
import { Refusals } from "@/components/sections/Refusals";

export default function Page() {
  return (
    <Providers>
      <Masthead />
      <main>
        <Hero />
        <Marquee />
        <Principles />
        <FeatureExplorer />
        <Box />
        <Refusals />
        <Pilot />
      </main>
      <Footer />
    </Providers>
  );
}
