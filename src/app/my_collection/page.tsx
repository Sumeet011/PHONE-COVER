import localFont from "next/font/local";
const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
});
import Navbar from '@/components/navbar/Navbar';
import SwipeCard from '@/components/homecomponents/SwipeCard';


const MyCollectionsPage = () => {
    return (
        <div className='overfow-x-none'>
            <Navbar />
            <div className='flex items-center justify-center min-h-20px py-2'>
                <h1
                          className={`${JersyFont.className} text-[#9AE600] text-4xl  sm:text-7xl mt-6 md:text-6xl lg:text-8xl`}
                        >
                          MY COLLECTION
                        </h1>
                </div>
                <div className='flex flex-col-2 sm:flex-col-4 lg-flex-col-4 items-center justify-center min-h-100px py-2'>
                    <SwipeCard />
                    </div>
            </div>
    )
}

export default MyCollectionsPage;
