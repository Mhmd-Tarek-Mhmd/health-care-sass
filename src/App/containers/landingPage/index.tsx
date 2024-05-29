import "./index.module.css";
import { Stack } from "@chakra-ui/react";

import Nav from "./Nav";
import Footer from "./Footer";
import CTASection from "./CTASection";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";

const LandingPage = () => {
  return (
    <Stack as="main" spacing={100}>
      <Nav />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </Stack>
  );
};

export default LandingPage;
