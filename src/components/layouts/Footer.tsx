const Footer = () => {
  return (
    <div className="border-t-1 h-40 bg-[radial-gradient(circle_at_center,_rgba(34,197,94,0.25)_0%,_rgba(0,0,0,0.9)_100%)] flex items-center">
      <div className="mt-10  flex flex-col sm:flex-row  relative">
        <div className="text-lg text-nowrap xl:ml-30 lg:ml-10 sm:mt-1 sm:flex sm:flex-col sm:justify-center">
          ©2025 Squirell Inc. All rights reserved.
        </div>
        <ul className=" font-semibold grid mt-1 underline grid-cols-1 ml-5 xl:ml-90 text-nowrap  gap-x-20 lg:grid-cols-3 lg:ml-30 md:grid-cols-2 md:ml-30 sm:grid-cols-1 sm:ml-30 sm:gap-y-1">
          <li className="cursor-pointer">Terms of Use</li>
          <li className="cursor-pointer">Community Guidelines</li>
          <li className="cursor-pointer">Privacy Policy</li>
          <li className="cursor-pointer">Working location policy</li>
          <li className="cursor-pointer">Cookies Policy</li>
          <li className="cursor-pointer">Data Processing Addendum</li>
        </ul>
      </div>
    </div>
  );
};

export default Footer;
