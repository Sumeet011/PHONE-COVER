'use client';
import { useState, Suspense, useEffect, useCallback } from "react";
import Navbar from "../../components/navbar/Navbar";
import FiltersContent from "../../components/FiltersContent";
import { FaSpinner } from "react-icons/fa";
import Img from "../../../public/images/card.webp";
import Filter from '../../../public/filter.svg'




type Drink = {
  id: number;
  name: string;
  image: string;
  price: number;
  Link: string;
  type?: string;
  category?: string;
  material?: string;
  finish?: string;
  design?: {
    type?: string;
  };
};

type FilterState = {
  Type?: string[];
  Material?: string[];
  Finish?: string[];
  "Design Type"?: string[];
  Price?: string[];
};

const BACKEND_URl=process.env.NEXT_PUBLIC_BACKEND_URL;

// components/Card.jsx
const ProductCard: React.FC<{ drink: Drink }> = ({ drink }) => {
  return (
    <a
      href={`/specific/${drink.id}`}
      className="group relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-[230px] w-[150px] min-[370px]:w-[180px] min-[370px]:h-[270px] md:h-[350px] md:w-[240px]"
    >
      <div className="mouse-pointer relative overflow-hidden rounded-xl h-[290px]">
        <img
          src={drink.image}
          alt={drink.name}
          className="w-full h-full object-cover"
        />
        <p className="absolute bottom-3 left-3 text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded">
          ₹{drink.price}
        </p>
      </div>

      <div className="mt-3">
        <h2 className="text-base md:text-lg font-semibold leading-tight line-clamp-1">
          {drink.name}
        </h2>
      </div>

      <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-white group-hover:bg-lime-400 flex items-center justify-center">
        <svg
          className="w-5 h-5 text-black"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 17l10-10M7 7h10v10"
          />
        </svg>
      </div>
    </a>
  );
};




const Drinks = () => {
  const [products, setProducts] = useState<Drink[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  useEffect(() => {
    fetch(`${BACKEND_URl}/api/products`) // Updated to port 3000
      .then((res) => res.json())
      .then((data) => {
        const productsList = data.items || [];
        //choose only products with type Standard
        const filtered = productsList.filter((product: any) => product.type === "Standard");

        setProducts(filtered);
        setFilteredProducts(filtered); // Initially show all products
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  // Apply filters whenever activeFilters change
  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Apply Type filter (gaming/Standard)
    if (activeFilters.Type && activeFilters.Type.length > 0) {
      filtered = filtered.filter((product: any) =>
        activeFilters.Type!.includes(product.type)
      );
    }


    // Apply Material filter
    if (activeFilters.Material && activeFilters.Material.length > 0) {
      filtered = filtered.filter((product: any) =>
        activeFilters.Material!.includes(product.material)
      );
    }

    // Apply Finish filter
    if (activeFilters.Finish && activeFilters.Finish.length > 0) {
      filtered = filtered.filter((product: any) =>
        product.finish && activeFilters.Finish!.includes(product.finish)
      );
    }

    // Apply Design Type filter
    if (activeFilters["Design Type"] && activeFilters["Design Type"].length > 0) {
      filtered = filtered.filter((product: any) =>
        product.design?.type && activeFilters["Design Type"]!.includes(product.design.type)
      );
    }

    // Apply Price filter
    if (activeFilters.Price && activeFilters.Price.length > 0) {
      const priceRange = activeFilters.Price[0];
      filtered = filtered.filter((product: any) => {
        const price = product.price;
        switch (priceRange) {
          case "₹0-₹199":
            return price >= 0 && price <= 199;
          case "₹200-₹399":
            return price >= 200 && price <= 399;
          case "₹400-₹599":
            return price >= 400 && price <= 599;
          case "₹600-₹999":
            return price >= 600 && price <= 999;
          case "₹1000+":
            return price >= 1000;
          default:
            return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 40;

  // Use filtered products for rendering
  const drinksToRender = filteredProducts;

  // Dummy email logic (no API)
  const [emailInput, setEmailInput] = useState("");
  const [cooldown, setCooldown] = useState(false);

  const handleGetCoupon = () => {
    if (!emailInput) {
      alert("Please enter your email.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(emailInput)) {
      alert("Invalid email format.");
      return;
    }

    if (cooldown) {
      alert("Please wait 20 seconds before requesting again.");
      return;
    }

    alert(`🎉 Coupon sent to ${emailInput}`);
    setEmailInput("");
    setCooldown(true);

    setTimeout(() => setCooldown(false), 20000);
  };

  return (
    <div className="bg-[#090701] text-white min-h-screen w-full max-w-full overflow-x-hidden">
      <Navbar />

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar Filters */}
        <aside className="w-full hidden md:hidden lg:block lg:w-1/5 p-4 space-y-6">
          <FiltersContent onFilterChange={handleFilterChange} />
        </aside>

        

        {/* Modal for filters on small screens */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 h-[80vh] flex justify-center items-center lg:hidden">
            <div className="bg-[#151311] w-[90%] max-h-[80vh] overflow-y-auto p-6 rounded-lg relative">
              <button
                onClick={() => setIsFilterOpen(false)}
                className="absolute top-2 right-3 text-white text-2xl font-bold"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-center">Filters</h2>
              <FiltersContent onFilterChange={handleFilterChange} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="w-full h-full lg:w-4/5 space-y-10">
          {/* Product Grid */}
<div>
  <div className="flex items-center justify-between mb-2 mt-5">
    <div>
      <h2 className="text-2xl font-bold ml-3 md:ml-7 xl:ml-10">
        {filteredProducts.length === products.length 
          ? 'All Products' 
          : `Filtered Products (${filteredProducts.length})`}
      </h2>
    </div>

    {/* Mobile filter toggle */}
    <div className="lg:hidden flex items-center justify-center">
      <div
        onClick={() => setIsFilterOpen(true)}
        className="flex items-center justify-center cursor-pointer w-8 h-8 mr-3 bg-gradient-to-t from-lime-300 to-lime-600 text-black rounded-full"
      >
        <img
          className="w-5 h-5 object-contain"
          src={Filter.src}
          alt="Filter"
        />
      </div>
    </div>
  </div>

  <div className="grid grid-cols-2 ml-3 mr-3 md:ml-7 md:mr-7 xl:ml-10 sm:grid-cols-3 xl:grid-cols-4 gap-6 -mb-8">
    {drinksToRender
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((drink) => (
        <Suspense
          fallback={
            <div className="relative bg-[#1a1816] rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-300 flex flex-col h-40">
              <FaSpinner />
            </div>
          }
          key={drink.id}
        >
          <ProductCard  drink={drink} />
        </Suspense>
      ))}
  </div>
</div>


          {/* Pagination */}
          <div className="flex justify-center mb-8 gap-2">
            {Array.from({ length: Math.ceil(drinksToRender.length / itemsPerPage) }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentPage(index + 1);
                  // Scroll to top when changing pages
                  window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                  });
                }}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-lime-400 text-black font-bold"
                    : "bg-[#151311] text-white"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Drinks;