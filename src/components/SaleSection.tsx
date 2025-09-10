"use client";

const SaleSection = () => {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/furniture/summer sale.jpg')`
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Sale Title */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.3em] text-white mb-8 drop-shadow-lg">
          SUMMER SALE
        </h2>

        {/* Shop All Button */}
        <button className="bg-white text-gray-900 px-8 py-3 text-sm font-medium tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
          SHOP ALL
        </button>
      </div>
    </section>
  );
};

export default SaleSection;
