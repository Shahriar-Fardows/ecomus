import CategorySlider from "@/components/home/home/CategorySlider";
import Features from "@/components/home/home/Features";
import ProductSlider from "@/components/home/home/FutureProduct";
import HeroSection from "@/components/home/home/Hero";
import JewelryBannerSection from "@/components/home/home/JewelryBanner";
import JewelryBannerfull from "@/components/home/home/JewelryBannerfull";
import ProductGrid from "@/components/home/home/RendomProductDetails";
import BlogSlider from "@/components/shared/BlogSlider/BlogSlider";



export const metadata = {
  title: "TeachFosys | Website Design & Development",
  description: "TeachFosys builds modern websites, e-commerce stores, and digital solutions for businesses.",
  keywords: "TeachFosys, web design, web development, ecommerce, digital agency",
};


export default function Home() {
  return (
    <div>
      <HeroSection/>
      <Features/>
      <CategorySlider/>
      <JewelryBannerSection/>
      <ProductSlider/>
      <JewelryBannerfull/>
      <ProductGrid/>
      <BlogSlider/>
    </div>
  )
}