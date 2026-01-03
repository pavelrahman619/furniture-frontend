"use client";

import { useState, FormEvent } from "react";
import { useToast } from "@/contexts/ToastContext";
import ContactService from "@/services/contact.service";

export default function ContactUs() {
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ContactService.submitContactForm(formData);
      success(
        "Message Sent",
        "Thank you for contacting us. We'll get back to you soon!"
      );
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        message: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        error("Failed to Send Message", err.message);
      } else {
        error("Failed to Send Message", "Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-light tracking-wider text-gray-900 mb-8">
          Contact Us
        </h1>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <p className="text-lg leading-relaxed">
            We're here to help! Whether you have questions about our products,
            financing options, delivery, or custom orders, the team at Palacios
            Home Co is ready to assist you.
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
                Stop by our showroom or contact us directly for personalized
                assistance. Our team is happy to help you find quality furniture
                that fits your style and budget.
              </p>
            </div>
          </div>
        </div>

        {/* General Inquiries Form */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-gray-900 mb-6">
            General Inquiries
          </h2>

          <div className="text-center mb-8 space-y-2">
            <p className="text-gray-700 font-medium">Corporate Headquarters</p>
            <a
              href="tel:(323)266-8993"
              className="text-gray-700 hover:text-gray-900 transition-colors block"
            >
              (323) 266-8993
            </a>
            <p className="text-gray-600 text-sm">Mon-Friday, 8AM-5PM PST</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            </div>

            <div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message here"
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 text-white uppercase px-8 py-3 rounded-md font-medium tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
              >
                {isSubmitting ? "Submitting..." : "SUBMIT"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
