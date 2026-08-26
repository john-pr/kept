import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HomeNav } from "@/components/homepage/HomeNav";
import { HeroSection } from "@/components/homepage/HeroSection";
import { SupportedTypesStrip } from "@/components/homepage/SupportedTypesStrip";
import { FeaturesSection } from "@/components/homepage/FeaturesSection";
import { AiSection } from "@/components/homepage/AiSection";
import { PricingSection } from "@/components/homepage/PricingSection";
import { FinalCtaSection } from "@/components/homepage/FinalCtaSection";
import { Footer } from "@/components/homepage/Footer";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <HomeNav />
      <main>
        <HeroSection />
        <SupportedTypesStrip />
        <FeaturesSection />
        <AiSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
