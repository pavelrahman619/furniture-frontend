export default function ContactUs() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-light tracking-wider text-gray-900 mb-8">
          Contact Us
        </h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <p className="text-lg leading-relaxed">
            We're here to help! Whether you have questions about our products, financing options, delivery, or custom orders, the team at Palacios Home Co is ready to assist you.
          </p>

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                📍 Visit Our Showroom
              </h2>
              <p className="text-lg text-gray-700">
                Palacios Home Co
                <br />
                Los Angeles, CA
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                📞 Call or Text
              </h2>
              <a 
                href="tel:(323)618-4663"
                className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
              >
                (323) 618-4663
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                📧 Email Us
              </h2>
              <a 
                href="mailto:info@palacioshomeco.com"
                className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
              >
                info@palacioshomeco.com
              </a>
            </div>

            <div>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                🕒 Store Hours
              </h2>
              <p className="text-lg text-gray-700">
                Monday - Saturday 11am - 7pm
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                💬 Need Help Choosing Furniture?
              </h2>
              <p className="text-lg text-gray-700">
                Stop by our showroom or contact us directly for personalized assistance. Our team is happy to help you find quality furniture that fits your style and budget.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

