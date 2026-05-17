'use client';

import HeroSection from '@/components/sections/HeroSection';
import PhilosophySection from '@/components/sections/PhilosophySection';
import AdjudicationSection from '@/components/sections/AdjudicationSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import FounderStorySection from '@/components/sections/FounderStorySection';
import PricingSection from '@/components/sections/PricingSection';
import FAQSection from '@/components/sections/FAQSection';
import WaitlistSection from '@/components/sections/WaitlistSection';
import FooterSection from '@/components/sections/FooterSection';

export default function Home() {
  return (
    <main className="bg-[#050505]">
      <HeroSection />
      <PhilosophySection />
      <AdjudicationSection />
      <HowItWorksSection />
      <FounderStorySection />
      <PricingSection />
      <FAQSection />
      <WaitlistSection />
      <FooterSection />
    </main>
  );
}
