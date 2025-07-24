import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { GiAcorn } from "react-icons/gi";
import { Link } from "react-router-dom";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useAuth } from "../../contexts/AuthContext";

const SideBar = () => {
  const [isopen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    setIsOpen(false); // Close sidebar after logout
  };

  return (
    <div
      onClick={() => setIsOpen(isopen ? false : true)}
      className={`${isopen ? "w-screen h-screen" : ""}`}
    >
      <button
        className="text-3xl text-[#adadad] fixed top-0 left-0"
        onClick={() => setIsOpen(!isopen)}
      >
        <TbLayoutSidebarRightCollapseFilled />
      </button>
      <AnimatePresence>
        {isopen && (
          <motion.div
            initial={{ x: -200 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 400, damping: 23 }}
            className="fixed top-0 left-0 w-60  bg-[#3333339f] backdrop-blur-sm h-screen  items-center flex-col flex text-center border-r"
          >
            <div className="flex p-2 flex-col text-green-900">
              <Link
                className="text-4xl flex  w-60 p-3 text-center text-green-300 "
                to={"/"}
              >
                Squirell <GiAcorn />
              </Link>
              <button
                className="text-3xl fixed top-0 text-[#adadad] left-60"
                onClick={() => setIsOpen(!isopen)}
              >
                <TbLayoutSidebarLeftCollapseFilled />
              </button>
            </div>
            <ul className="flex flex-col gap-5 text-xl mt-10 ">
              <HoverCard>
                <HoverCardTrigger className="p-2 cursor-pointer font-semibold hover:bg-green-700 transition bg-transparent rounded-lg ">
                  <Link to={"/home"}>Home</Link>
                </HoverCardTrigger>
                <HoverCardContent className=" break-words text-center">
                  Manage your current assets, get started for free by logging in
                  to your account.
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger className="p-2 cursor-pointer font-semibold hover:bg-green-700 transition bg-transparent rounded-lg">
                  <Link to={"/listings"}>Listings</Link>
                </HoverCardTrigger>
                <HoverCardContent>
                  <div className=" rounded ">
                    <div>
                      <img
                        className="rounded-lg"
                        src="/img/painting.png"
                        alt=""
                      />
                    </div>
                    <p className="text-lg">Explore, buy and sell products.</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger className="p-2 cursor-pointer font-semibold hover:bg-green-700 transition bg-transparent rounded-lg">
                  <Link to={"/contact"}>Rate Your Experince</Link>
                </HoverCardTrigger>
                <HoverCardContent className="text-center">
                  Give us your feedback
                </HoverCardContent>
              </HoverCard>
              {user ? (
                <button
                  className="p-2 cursor-pointer bg-green-600 transition hover:bg-green-700 rounded-lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              ) : (
                <Link to={"/login"}>
                  <button className="p-2 cursor-pointer bg-green-600 transition hover:bg-green-700 rounded-lg w-full">
                    Sign In
                  </button>
                </Link>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SideBar;
