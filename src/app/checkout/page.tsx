"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, CreditCard, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import OrderService from "@/services/order.service";

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// interface BillingInfo {
//   sameAsShipping: boolean;
//   firstName: string;
//   lastName: string;
//   address: string;
//   apartment: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

const CheckoutPage = () => {
  const { cartItems, getTotalPrice } = useCart();
  const router = useRouter();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  // const [billingInfo, setBillingInfo] = useState<BillingInfo>({
  //   sameAsShipping: true,
  //   firstName: "",
  //   lastName: "",
  //   address: "",
  //   apartment: "",
  //   city: "",
  //   state: "",
  //   zipCode: "",
  //   country: "United States",
  // });

  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Calculate pricing
  const subtotal = getTotalPrice();
  const memberSavings = cartItems.reduce((total, item) => {
    const memberPrice = Math.round(item.price * 0.7);
    const regularPrice = item.price;
    return total + (regularPrice - memberPrice) * item.quantity;
  }, 0);
  const shipping = 0; // Free shipping
  const tax = Math.round(subtotal * 0.08); // 8% tax
  const total = subtotal + shipping + tax;

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // const handleBillingChange = (
  //   field: keyof BillingInfo,
  //   value: string | boolean
  // ) => {
  //   setBillingInfo((prev) => ({ ...prev, [field]: value }));
  // };

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!shippingInfo.lastName.trim())
      newErrors.lastName = "Last name is required";
    if (!shippingInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(shippingInfo.email))
      newErrors.email = "Email is invalid";
    if (!shippingInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.state.trim()) newErrors.state = "State is required";
    if (!shippingInfo.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (validateForm()) {
      setIsProcessing(true);

      try {
        // Prepare order data
        const orderData = {
          items: cartItems.map((item) => ({
            product_id: item.id, // Use the original MongoDB ObjectId
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
          shipping_address: {
            street: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip_code: shippingInfo.zipCode,
            country: shippingInfo.country,
          },
          billing_address: {
            street: shippingInfo.address,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip_code: shippingInfo.zipCode,
            country: shippingInfo.country,
          },
          payment_method: "Credit Card", // You can add payment method selection later
          customer_email: shippingInfo.email,
          customer_phone: shippingInfo.phone,
        };

        // Create order through backend
        const orderId = await OrderService.createOrder(orderData);

        // Redirect to order success page with order ID
        router.push(`/order-success?orderId=${orderId}`);
      } catch (error) {
        console.error("Failed to create order:", error);
        setIsProcessing(false);

        // Handle different types of errors
        let errorMessage = "Failed to place order. Please try again.";

        if (error instanceof Error) {
          if (error.message.includes('Network error')) {
            errorMessage = "Network error. Please check your internet connection and try again.";
          } else if (error.message.includes('400')) {
            errorMessage = "Invalid order data. Please check your information and try again.";
          } else if (error.message.includes('500')) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = error.message;
          }
        }

        setOrderError(errorMessage);
      }
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-8 py-3 font-medium tracking-wider hover:bg-gray-800 transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-light text-gray-900 tracking-wider">
            CHECKOUT
          </h1>
        </div>

        {/* Delivery Zone Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl" role="img" aria-label="Delivery truck">
                🚚
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-blue-900 mb-1">
                We currently deliver only to Los Angeles, CA
              </h3>
              <p className="text-sm text-blue-700">
                Free delivery for orders over $1,000 within 5-10 miles
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Contact Information */}
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-light text-gray-900 tracking-wider mb-6">
                CONTACT INFORMATION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) =>
                      handleShippingChange("firstName", e.target.value)
                    }
                    className={`w-full border ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) =>
                      handleShippingChange("lastName", e.target.value)
                    }
                    className={`w-full border ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      handleShippingChange("email", e.target.value)
                    }
                    className={`w-full border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      handleShippingChange("phone", e.target.value)
                    }
                    className={`w-full border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-light text-gray-900 tracking-wider mb-6">
                SHIPPING ADDRESS
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      handleShippingChange("address", e.target.value)
                    }
                    className={`w-full border ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.apartment}
                    onChange={(e) =>
                      handleShippingChange("apartment", e.target.value)
                    }
                    className="w-full border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        handleShippingChange("city", e.target.value)
                      }
                      className={`w-full border ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        handleShippingChange("state", e.target.value)
                      }
                      className={`w-full border ${
                        errors.state ? "border-red-500" : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) =>
                        handleShippingChange("zipCode", e.target.value)
                      }
                      className={`w-full border ${
                        errors.zipCode ? "border-red-500" : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-gray-200 p-8">
              <h2 className="text-2xl font-light text-gray-900 tracking-wider mb-6">
                PAYMENT
              </h2>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                  <span className="text-gray-700 font-medium">
                    Secure Payment Processing
                  </span>
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <p className="text-center text-sm text-gray-600 mb-6">
                  Your payment information is securely processed. We accept all
                  major credit cards.
                </p>
                <button
                  onClick={handleContinueToPayment}
                  disabled={isProcessing}
                  className={`w-full ${
                    isProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800"
                  } text-white py-4 px-8 font-medium tracking-wider transition-colors`}
                >
                  {isProcessing ? "PROCESSING..." : "CONTINUE TO PAYMENT"}
                </button>

                {orderError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">{orderError}</p>
                    <button
                      onClick={() => setOrderError(null)}
                      className="mt-2 text-red-600 text-sm underline hover:text-red-800"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 p-8 sticky top-8">
              <h2 className="text-2xl font-light text-gray-900 tracking-wider mb-6">
                ORDER SUMMARY
              </h2>

              {/* Order Items */}
              <div className="space-y-6 mb-8">
                {cartItems.map((item) => {
                  const memberPrice = Math.round(item.price * 0.7);
                  return (
                    <div key={item.id} className="flex space-x-4">
                      <div className="relative w-16 h-16 bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        <span className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium">
                            ${memberPrice.toLocaleString()} Member
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Savings</span>
                  <span className="text-green-600">
                    -${memberSavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {shipping === 0
                      ? "FREE"
                      : `$${(shipping as number).toLocaleString()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Secure Checkout
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Your personal information is protected by 256-bit SSL
                  encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
