const SkeletonLayout = () => {
  return (
    <div>
      <div className="flex w-52 flex-col gap-4">
        <div className="skeleton h-32 w-full bg-[#333]"></div>
        <div className="skeleton h-4 w-28 bg-[#333]"></div>
        <div className="skeleton h-4 w-full bg-[#333]"></div>
        <div className="skeleton h-4 w-full bg-[#333]"></div>
      </div>
    </div>
  );
};

export default SkeletonLayout;
