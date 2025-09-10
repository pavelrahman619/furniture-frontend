"use client";

const MadeInUSA = () => {
  return (
    <section className="relative h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/furniture/new introduction.jpg')`,
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Main Title */}
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[0.3em] text-white mb-6 drop-shadow-lg">
          MADE IN THE USA
        </h2>

        {/* Subtitle */}
        <p className="text-lg md:text-xl lg:text-2xl font-light tracking-wider text-white mb-12 drop-shadow-lg">
          Custom Palacios Home Made to Order
        </p>

        {/* Contact Us Button */}
        <button className="bg-white text-gray-900 px-10 py-4 text-sm font-medium tracking-wider uppercase hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
          CONTACT US
        </button>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-px h-16 bg-white/50"></div>
      </div>
    </section>
  );
};

export default MadeInUSA;
