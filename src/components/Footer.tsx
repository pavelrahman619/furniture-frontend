"use client";

import { useState } from "react";
import { Instagram, Facebook, Linkedin } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");

  // First column links
  const firstColumnLinks = [
    "About us",
    "Contact us", 
    "Terms and conditions"
  ];

  // Second column links
  const secondColumnLinks = [
    "Delivery status",
    "Admin login"
  ];

  // Third column links
  const thirdColumnLinks = [
    "Privacy policy",
    "Delivery policy"
  ];

  // Commented out - not needed
  // const companyLinks = [
  //   "About Palacios Home",
  //   "Careers",
  //   "Meet Our Team",
  //   "Press Inquiries",
  //   "Contact Us",
  //   "Join Today",
  //   "Made In America",
  //   "Terms & Conditions",
  //   "Privacy Policy",
  // ];

  // const accountLinks = [
  //   "My Account",
  //   "Claims Portal",
  //   "Delivery & Shipping",
  //   "Catalogs & Subscriptions",
  // ];

  // const connectLinks = [
  //   "FAQs",
  //   "Palacios Home Trade Program",
  //   "Design Services",
  //   "Find an Account Manager",
  //   "Care Guide",
  // ];

  // const showroomLinks = [
  //   "Las Vegas Tour",
  //   "High Point Tour",
  //   "Atlanta Tour",
  //   "Dallas Tour",
  //   "Los Angeles Tour",
  // ];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Logo Section */}
          <div className="lg:col-span-5 mb-8">
            <h2 className="text-3xl font-light tracking-widest text-white">
              PALACIOS HOME CO.
            </h2>
          </div>

          {/* First Column - About us, Contact us, Terms and conditions */}
          <div className="space-y-4">
            <ul className="space-y-3">
              {firstColumnLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            {/* Email contact */}
            <div className="mt-4">
              <span className="text-sm text-gray-400 mb-1">Email: </span>
              <a
                href="mailto:info@palacioshomeco.com"
                className="text-sm text-white hover:text-gray-300 transition-colors duration-200"
              >
                info@palacioshomeco.com
              </a>
            </div>
          </div>

          {/* Second Column - Delivery status, Admin login */}
          <div className="space-y-4">
            <ul className="space-y-3">
              {secondColumnLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Third Column - Privacy policy, Delivery policy */}
          <div className="space-y-4">
            <ul className="space-y-3">
              {thirdColumnLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Fourth Column - Omitted as requested */}
          {/* <div></div> */}

          {/* Fifth Column - Contact Info & Social Media */}
          <div className="space-y-4">
            {/* Address */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase mb-2">
                Address:
              </h3>
              <p className="text-sm text-gray-400">
                500 W 7th St<br />
                Los Angeles, CA 90014
              </p>
            </div>
            
            {/* Phone */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase mb-2">
                Phone:
              </h3>
              <a
                href="tel:(323)618-4663"
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
              >
                (323) 618-4663
              </a>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase mb-2">
                Follow Us:
              </h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/palacioshomeco?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61576768246518&mibextid=wwXIfr"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
            </div>
          </div>

          {/* Commented out sections - not needed */}
          {/* 
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Account
            </h3>
            <ul className="space-y-3">
              {accountLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Connect
            </h3>
            <ul className="space-y-3">
              {connectLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
              Showrooms
            </h3>
            <ul className="space-y-3">
              {showroomLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
                Contact
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <a
                    href="mailto:info@palacioshomeco.com"
                    className="text-sm text-white hover:text-gray-300 transition-colors duration-200"
                  >
                    info@palacioshomeco.com
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
                Newsletter
              </h3>
              <p className="text-sm text-gray-400">
                Get trend updates, promotions and more
              </p>
              <form onSubmit={handleEmailSubmit} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-600 border border-gray-600 rounded-r-md hover:bg-gray-500 transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
