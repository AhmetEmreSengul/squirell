import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { GiAcorn } from "react-icons/gi";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div>
      <AnimatePresence>
        <motion.div
          className="mt-5 flex"
          /* initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50 }}
          transition={{ delay: 0.3 }} */
        >
          <div className="p-2 text-4xl flex lg:ml-30 text-green-300 md:ml-0">
            <Link to={"/"}>Squirell</Link> <GiAcorn />
          </div>
          <div className="flex-1 flex justify-end md:ml-0 lg:ml-40 xl:ml-100 2xl:ml-190"></div>
          <NavigationMenu viewport={false} className="">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  {" "}
                  <Link className="text-xl" to={"/home"}>
                    {" "}
                    Home{" "}
                  </Link>{" "}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-2 sm:w-[150px] md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] ">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="from-muted/10 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium">
                            Squirell
                          </div>
                          <p className="text-muted-foreground text-sm leading-tight">
                            First stop to start earning
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <div className="flex justify-center items-center text-center">
                      Manage your current and bookmarked assets, get started for
                      free by logging in.
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <Link className="text-xl" to={"/listings"}>
                    Listings
                  </Link>
                </NavigationMenuTrigger>
                <NavigationMenuContent className="text-nowrap">
                  <div className=" rounded shadow-lg">
                    <div className="">
                      <img src="/img/painting.png" alt="" />
                    </div>
                    <p className="text-lg">Explore, buy and sell products.</p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  {" "}
                  <Link className="text-xl" to={"/contact"}>
                    Learn About Squirell
                  </Link>{" "}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="text-nowrap">
                  Learn about Squirell, Give us your feedback!
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
            {user ? (
              <div className="flex items-center  ml-4">
                <Button
                  className="cursor-pointer text-lg"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
                <span className="text-sm text-green-200 ml-10 text-nowrap">
                  Signed in as {user.firstName}
                </span>
              </div>
            ) : (
              <Button className="ml-1 cursor-pointer text-lg">
                <Link to={"/login"}>Sign In</Link>
              </Button>
            )}
          </NavigationMenu>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
