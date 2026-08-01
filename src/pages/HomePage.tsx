import { motion, useScroll, useSpring } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Categories } from "@/components/sections/Categories";
import { LatestDemands } from "@/components/sections/LatestDemands";
import { Leaderboards } from "@/components/sections/Leaderboards";
import { Rewards } from "@/components/sections/Rewards";
import { Testimonials } from "@/components/sections/Testimonials";
import { JoinCTA } from "@/components/sections/JoinCTA";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <>
      {/* 顶部滚动进度条 */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed top-0 inset-x-0 h-1 origin-left bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 z-[60]"
      />

      <Navbar />

      <main>
        <Hero />
        <HowItWorks />
        <Categories />
        <LatestDemands />
        <Leaderboards />
        <Rewards />
        <Testimonials />
        <JoinCTA />
      </main>

      <Footer />
    </>
  );
}
