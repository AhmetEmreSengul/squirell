import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import SideBar from "../layouts/SideBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import FeaturedCards from "../layouts/FeaturedCards";
import axios from "../../utils/axios";
import SkeletonLayout from "../layouts/SkeletonLayout";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

interface Product {
  createdAt: string;
  _id: string;
  title: string;
  description: string;
  assetType: string;
  category: string;
  totalValue: number;
  sharePrice: number;
  totalShares: number;
  availableShares: number;
  minimumInvestment: number;
  images: Array<{ url: string; alt: string }>;
  owner: {
    firstName: string;
    lastName: string;
  };
  status?: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  bookmarks?: string[]; // Array of user IDs who bookmarked the product
}

const Listings = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/products", {
          params: {
            search: debouncedSearch,
            sortBy:
              sort === "latest"
                ? "createdAt"
                : sort === "alphabetical"
                ? "title"
                : "sharePrice",
            sortOrder: sort === "low" ? "asc" : "desc",
            limit: 12,
            page: page,
          },
        });
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.totalPages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearch, sort, page]);

  // Reset to page 1 when search or sort changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col relative min-h-full w-screen items-center justify-between">
      <div>
        <div className="flex md:hidden z-[50] fixed top-0 left-0 ">
          <SideBar />
        </div>
        <div className="md:flex hidden w-screen left-0 fixed backdrop-blur-sm bg-black/15 z-50">
          <Navbar />
        </div>
        <div className="mt-40 flex flex-col items-center lg:flex-row lg:justify-end gap-3">
          <div>
            <input
              className="border-2 border-green-900 hover:border-green-600 transition rounded-lg  text-lg p-1"
              type="text"
              placeholder="Search Products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Select onValueChange={setSort}>
              <SelectTrigger className="border-2 border-green-900 w-[200px] h-40 hover:border-green-600 transition rounded-lg  text-lg p-[18px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="high">High to Low</SelectItem>
                <SelectItem value="low">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="justify-end p-2 bg-green-600 rounded-lg font-bold cursor-pointer hover:bg-green-500 transition">
            <Link to={"/create"}>Create Product</Link>
          </div>
        </div>
        <div className="mt-20">
          {loading ? (
            <div className="text-center text-white text-xl grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10">
              <SkeletonLayout />
              <SkeletonLayout />
              <SkeletonLayout />
              <SkeletonLayout />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 text-xl">{error}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-white text-xl">
              No products found
            </div>
          ) : (
            <>
              <motion.div className="z-0 mr-20 ml-20 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20 mt-20 w-fit">
                {products.map((product: Product) => (
                  <motion.div
                    key={product._id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <FeaturedCards
                      product={{
                        ...product,
                        createdAt: product.createdAt ?? "",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
              {/* Pagination Bar */}
              <div className="flex justify-center mt-10 mb-5">
                <nav className="inline-flex justify-center gap-2">
                  <button
                    className="px-3 py-2 rounded-l bg-green-700 text-white disabled:bg-[#636363]"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <MdNavigateBefore />
                  </button>
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={"ellipsis-" + idx} className="px-2">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`px-3 py-1 ${
                          p === page
                            ? "bg-green-600 text-white font-bold"
                            : "bg-[#636363] text-[#adadad]"
                        } border border-green-700`}
                        onClick={() => setPage(Number(p))}
                        disabled={p === page}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="px-3 py-2 rounded-r bg-green-700 text-white disabled:bg-[#3b3b3b]"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <MdNavigateNext />
                  </button>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
      {/*  <footer className="mt-20 w-full items-center  ">
        <Footer />
      </footer> */}
    </div>
  );
};

export default Listings;
