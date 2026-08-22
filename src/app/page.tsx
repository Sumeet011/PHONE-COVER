
import CardCarouselParent from '@/components/homecomponents/CardCarouselParent'
import HeroContent from '@/components/landingPage/HeroContent'
import Navbar from '@/components/navbar/Navbar'
import  TextScrollDemo  from '@/components/homecomponents/TextScroll'
import React from 'react'
import DrinksPage from '@/components/homecomponents/products'
import Circularcontent from '@/components/landingPage/Circularcontent'
import HorizontalScrollableCards from '@/components/landingPage/HorizontalScroll'
import Leaderboard from '@/components/landingPage/LeaderBoars'
import Review from '@/components/homecomponents/Review'
import Footer from '@/components/homecomponents/Footer'


const page = () => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  console.log("Backend URL:", BACKEND_URL);
  

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <Navbar />
      <div className='mt-25'>
      <TextScrollDemo />
      <HeroContent />
      <CardCarouselParent />
      <DrinksPage />
      <Circularcontent/>
      <HorizontalScrollableCards />
      {/*<Leaderboard/>*/}
      <Review/>
      <Footer />
      </div>
    </div>
  )
}


export default page