import HeroSection from "@frontend/components/home/01-Hero";
import Partners from "@frontend/components/home/02-Partners";
import WhyOurRPC from "@frontend/components/home/03-Why-Porters";
import SupportedChains from "@frontend/components/home/04-Supported-Chains";
import OurStory from "@frontend/components/home/05-Our-Story";
import Footer from "@frontend/components/home/07-Footer";
import { Stack } from "@mantine/core";

export default function HomePage() {
  return (
    <Stack bg="cream.1">
      <HeroSection />
      <Partners />
      <WhyOurRPC />
      <SupportedChains />
      <OurStory />
      <Footer />
    </Stack>
  );
}
