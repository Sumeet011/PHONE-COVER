"use client";
import Navbar from "@/components/navbar/Navbar";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import localFont from "next/font/local";
import CurvedLoop from "../../components/contactcomp/CurvedLoop";
import Footer from "@/components/homecomponents/Footer";

 const JersyFont = localFont({ 
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});

const Contact = () => {
  return (
    <div className="bg-[#090701] text-white min-h-screen min-w-screen flex flex-col m-0 p-0">
      <Navbar />
      <div className="font-sans mt-25 flex-1 mb-0 pb-0">
       

        {/* Main Section */}
        <section className="bg-[#090701] text-white -mt-10 py-10 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Form */}
          <div className="w-full  [769px]:w-2/3">
            <p className="text-black text-sm mb-2">Contact Us</p>
            <h2 className={` ${JersyFont.className} text-[#9AE600] text-5xl min-[500px]:text-7xl mb-6 leading-snug`}>
              Join Us in Creating  Something Great
            </h2>

            <form
              className="grid text-black grid-cols-1 md:grid-cols-2 gap-4"
              method="post"
              action="https://formsubmit.co/xavierrodgriues123@gmail.com"
            >
              <input
                type="text"
                placeholder="First Name*"
                className="p-3 rounded bg-gray-200"
                name="firstname"
              />
              <input
                type="text"
                placeholder="Last Name*"
                className="p-3 rounded bg-gray-200"
                name="lastname"
              />
              <input
                type="email"
                placeholder="Email*"
                className="p-3 rounded bg-gray-200"
                name="email"
              />
              <input
                type="text"
                placeholder="Phone Number*"
                className="p-3 rounded bg-gray-200"
                name="phone"
              />
              <input
                type="text"
                placeholder="Subject*"
                className="p-3 rounded bg-gray-200 md:col-span-2"
                name="subject"
              />
              <textarea
                placeholder="Message*"
                rows="4"
                className="p-3 rounded bg-gray-200 md:col-span-2"
                name="message"
              ></textarea>
              <div className="flex sm:flex-row gap-3 sm:gap-5 mt-4 text-sm">
                <button className="bg-lime-400 hover:cursor-pointer active:scale-95 text-black font-semibold px-6 py-3 rounded-full w-fit">
                  Send Message
                </button>
               
              </div>
            </form>
          </div>

          {/* Right: Info Box */}
          <div className="bg-lime-400 rounded-lg p-6 text-black w-full lg:w-1/3 min-[768px]:mt-27 min-[1252px]:mt-5  relative transform hover:rotate-6 transition-transform duration-500">
            <div className="absolute top-[-30px] right-[-30px] bg-black text-white rounded-full w-[140px] h-[140px] flex items-center justify-center text-xs font-bold text-center leading-tight">
              <img
                className="rotate-320"
                src="/monster-resources-hackathon/right-arrow-svgrepo-com.svg"
                alt=""
              />
            </div>

            <div className="h-full px-2 py-8">
              <div className="mb-6">
                <h3 className="font-bold mb-1 text-lg">Address</h3>
                <a
                  href="https://www.google.com/maps?q=(3291+Energy+Beverages+LLC+Company+2390+Anselmo+Drive)"
                  target="_blank"
                >
                  1 Monster Way Corona <br /> Corona, CA 92879
                </a>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-1 text-lg">Contact</h3>
                <p>Phone : 1-866-322-4466</p>
                <p>Email : example@email.com</p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-1 text-lg">Open Time</h3>
                <p>Mon - Fri: 8 AM - 5 PM PST</p>
              </div>

              <div>
                <h3 className="font-bold mb-2 text-lg">Stay Connected</h3>
                <div className="flex gap-3 text-xl">
                  <a
                    href="https://www.facebook.com/MonsterEnergy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://x.com/MonsterEnergy?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="https://www.instagram.com/monsterenergy/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.youtube.com/monsterenergy"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Curved Marquee */}
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
