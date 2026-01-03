
import CardCarouselParent from '@/components/homeCards/CardCarouselParent'
import HeroContent from '@/components/landingPage/HeroContent'
import Navbar from '@/components/navbar/Navbar'
import  TextScrollDemo  from '@/components/homeCards/TextScroll'
import React from 'react'
import DrinksPage from '@/components/homeCards/ProductCard'
import Circularcontent from '@/components/landingPage/Circularcontent'
import HorizontalScrollableCards from '@/components/landingPage/HorizontalScroll'
import Leaderboard from '@/components/landingPage/LeaderBoars'
import Review from '@/components/homeCards/Review'
import Footer from '@/components/homeCards/Footer'


const page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log("Backend URL:", BACKEND_URL);
  

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Navbar />
      <TextScrollDemo />
      <HeroContent />
      <CardCarouselParent />
      <DrinksPage />
      <Circularcontent/>
      <HorizontalScrollableCards />
      <Leaderboard/>
      <Review/>
      <Footer />
    </div>
  )
}


export default page