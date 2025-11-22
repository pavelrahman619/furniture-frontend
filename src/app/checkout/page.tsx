"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, CreditCard, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import OrderService from "@/services/order.service";
import DeliveryService, { AddressData } from "@/services/delivery.service";

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
    city: "Los Angeles",
    state: "CA",
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
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState<string | null>(
    null
  );
  const [deliveryInfo, setDeliveryInfo] = useState<{
    cost: number;
    isFree: boolean;
    distanceMiles: number;
    calculated: boolean;
  } | null>(null);

  const [shippingEstimate, setShippingEstimate] = useState<{
    cost: number;
    isFree: boolean;
    distanceMiles: number;
    isEstimate: boolean;
    loading: boolean;
  } | null>(null);

  // Calculate pricing
  const subtotal = getTotalPrice();

  // Use final delivery info if available, otherwise use estimate
  const currentShippingInfo = deliveryInfo || shippingEstimate;
  // Check if this is an error state (invalid location)
  const isErrorState =
    currentShippingInfo &&
    currentShippingInfo.cost === 0 &&
    (shippingEstimate ? !shippingEstimate.isEstimate : false);
  // Don't charge shipping for invalid locations (error state)
  const shipping =
    currentShippingInfo && !isErrorState
      ? currentShippingInfo.isFree
        ? 0
        : currentShippingInfo.cost
      : 0;

  // Calculate tax (9.75% on subtotal + shipping)
  const taxableAmount = subtotal + shipping;
  const tax = Math.round(taxableAmount * 0.0975);
  // Backend formula: total = subtotal + delivery_cost + tax
  const total = subtotal + shipping + tax;

  const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Debounced shipping estimation
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const estimateShipping = useCallback(
    async (address: Partial<AddressData>) => {
      // Only estimate if we have the ZIP code (the key field for delivery estimation)
      if (!address.zip_code) {
        // Clear shipping estimate if no ZIP code
        setShippingEstimate(null);
        return;
      }

      setShippingEstimate((prev) => (prev ? { ...prev, loading: true } : null));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced API call
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Use available address data, filling in defaults for missing fields
          const fullAddress: AddressData = {
            street: address.street || "",
            city: address.city || "Los Angeles", // Default to LA since we only deliver there
            state: address.state || "CA", // Default to CA since we only deliver there
            zip_code: address.zip_code || "",
            country: address.country || "United States",
          };

          const result = await DeliveryService.calculateDeliveryCost(
            fullAddress,
            subtotal
          );

          setShippingEstimate({
            cost: result.delivery_cost,
            isFree: result.is_free_delivery,
            distanceMiles: result.distance_miles,
            isEstimate: true,
            loading: false,
          });
        } catch (error) {
          console.error("Shipping estimation failed:", error);

          // Check if error is about invalid location (not in LA)
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          const isLocationError =
            errorMessage.includes(
              "Delivery is only available in Los Angeles, CA"
            ) ||
            errorMessage.includes("not in LA") ||
            errorMessage.includes("Invalid address");

          if (isLocationError) {
            // Show error state for invalid location
            setShippingEstimate({
              cost: 0,
              isFree: false,
              distanceMiles: 0,
              isEstimate: false,
              loading: false,
            });
          } else {
            // Show fallback estimate only for network/API errors
            setShippingEstimate({
              cost: 50, // No default charge on fallback
              isFree: subtotal >= 1000, // Check if order qualifies for free delivery
              distanceMiles: 0,
              isEstimate: true,
              loading: false,
            });
          }
        }
      }, 800); // 800ms debounce delay
    },
    [subtotal]
  );

  // Trigger shipping estimation when ZIP code changes (the key field for delivery estimation)
  useEffect(() => {
    const addressForEstimation: Partial<AddressData> = {
      street: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip_code: shippingInfo.zipCode,
      country: shippingInfo.country,
    };

    // Clear loading state when ZIP code changes
    if (shippingEstimate?.loading) {
      setShippingEstimate((prev) =>
        prev ? { ...prev, loading: false } : null
      );
    }

    estimateShipping(addressForEstimation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingInfo.zipCode, estimateShipping]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
    if (!shippingInfo.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPayment = async () => {
    if (validateForm()) {
      setIsValidatingAddress(true);
      setOrderError(null);
      setValidationSuccess(null);

      try {
        // First validate the delivery address
        const addressData: AddressData = {
          street: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zip_code: shippingInfo.zipCode,
          country: shippingInfo.country,
        };

        const validationResult = await DeliveryService.validateAddress(
          addressData
        );

        if (!validationResult.within_delivery_zone) {
          setOrderError(
            "Sorry, we don't deliver to this address yet. Please check that your address is in Los Angeles, CA."
          );
          setIsValidatingAddress(false);
          return;
        }

        // Address is valid, show success message with distance
        setValidationSuccess(
          `✓ Address validated! Your location is ${validationResult.distance_miles.toFixed(
            1
          )} miles from our warehouse.`
        );

        // Calculate delivery cost
        try {
          const costResult = await DeliveryService.calculateDeliveryCost(
            addressData,
            subtotal
          );

          setDeliveryInfo({
            cost: costResult.delivery_cost,
            isFree: costResult.is_free_delivery,
            distanceMiles: costResult.distance_miles,
            calculated: true,
          });

          // Clear the estimate now that we have final delivery info
          setShippingEstimate(null);

          // Show free delivery message if applicable
          if (costResult.is_free_delivery) {
            setValidationSuccess(
              `✓ Address validated! Your location is ${validationResult.distance_miles.toFixed(
                1
              )} miles from our warehouse. Free Delivery! Your order qualifies.`
            );
          }
        } catch (costError) {
          console.error("❌ Delivery cost calculation failed:", costError);
          // Set default delivery cost if calculation fails
          setDeliveryInfo({
            cost: 50, // Default delivery cost
            isFree: false,
            distanceMiles: validationResult.distance_miles,
            calculated: true,
          });
          setValidationSuccess(
            `✓ Address validated! Your location is ${validationResult.distance_miles.toFixed(
              1
            )} miles from our warehouse.`
          );
        }

        // Proceed to payment processing
        setIsValidatingAddress(false);
        setIsProcessing(true);

        try {
          // Prepare order data
          // Use the same shipping info that's displayed to the user
          const shippingCost =
            currentShippingInfo && !isErrorState
              ? currentShippingInfo.isFree
                ? 0
                : currentShippingInfo.cost
              : 0;
          const distanceMiles =
            deliveryInfo?.distanceMiles ||
            currentShippingInfo?.distanceMiles ||
            validationResult.distance_miles;

          console.log("📦 Order submission data:", {
            deliveryInfo,
            currentShippingInfo,
            shippingCost,
            distanceMiles,
            shipping: shipping,
            subtotal,
            total,
          });

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
            delivery_cost: shippingCost,
            distance_miles: distanceMiles,
            delivery_zone_validated: true,
            subtotal: subtotal,
            total: subtotal + shippingCost + tax, // Backend requires 'total' field
            amount: subtotal + shippingCost + tax, // Total amount for payment (used by Stripe)
          };

          // Store order data in session storage for payment page
          sessionStorage.setItem("pendingOrder", JSON.stringify(orderData));

          // Redirect to secure payment processing
          router.push("/payment");
        } catch (error) {
          console.error("Failed to prepare order for payment:", error);
          setIsProcessing(false);
          setOrderError("Failed to proceed to payment. Please try again.");
        }
      } catch (validationError) {
        console.error("Address validation failed:", validationError);
        setIsValidatingAddress(false);

        // Handle validation errors
        let errorMessage =
          "Unable to validate your delivery address. Please try again.";

        if (validationError instanceof Error) {
          if (
            validationError.message.includes("Network error") ||
            validationError.message.includes("fetch")
          ) {
            errorMessage =
              "Network error. Please check your internet connection and try again.";
          } else if (validationError.message.includes("500")) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = validationError.message;
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
                    className={`w-full border ${errors.firstName ? "border-red-500" : "border-gray-300"
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
                    className={`w-full border ${errors.lastName ? "border-red-500" : "border-gray-300"
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
                    className={`w-full border ${errors.email ? "border-red-500" : "border-gray-300"
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
                    className={`w-full border ${errors.phone ? "border-red-500" : "border-gray-300"
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
                    className={`w-full border ${errors.address ? "border-red-500" : "border-gray-300"
                      } px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                {/* <div>
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
                </div> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      disabled
                      className="w-full border border-gray-300 bg-gray-50 text-gray-500 px-4 py-3 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      disabled
                      className="w-full border border-gray-300 bg-gray-50 text-gray-500 px-4 py-3 cursor-not-allowed"
                    />
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
                      className={`w-full border ${errors.zipCode ? "border-red-500" : "border-gray-300"
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
                  disabled={isProcessing || isValidatingAddress}
                  className={`w-full ${isProcessing || isValidatingAddress
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-900 hover:bg-gray-800"
                    } text-white py-4 px-8 font-medium tracking-wider transition-colors`}
                >
                  {isValidatingAddress
                    ? "VALIDATING ADDRESS..."
                    : isProcessing
                      ? "PROCESSING..."
                      : "CONTINUE TO PAYMENT"}
                </button>

                {validationSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-600 text-sm text-center">
                      {validationSuccess}
                    </p>
                  </div>
                )}

                {orderError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm text-center">
                      {orderError}
                    </p>
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
                            ${item.price.toLocaleString()}
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
                {/* <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={`text-gray-900 ${
                      isErrorState
                        ? "text-red-600 font-medium"
                        : "text-green-600 font-medium"
                    }`}
                  >
                    {isErrorState
                      ? "Delivery not available for this location"
                      : "FREE DELIVERY!"}
                  </span>
                </div> */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className={`text-gray-900 ${isErrorState
                      ? "text-red-600 font-medium"
                      : currentShippingInfo?.isFree
                        ? "text-green-600 font-medium"
                        : ""
                      }`}
                  >
                    {isErrorState
                      ? "Delivery not available for this location"
                      : deliveryInfo
                        ? deliveryInfo.isFree
                          ? "FREE DELIVERY!"
                          : `$${deliveryInfo.cost.toLocaleString()}`
                        : shippingEstimate
                          ? shippingEstimate.loading
                            ? "ESTIMATING..."
                            : shippingEstimate.isFree
                              ? `FREE DELIVERY!${shippingEstimate.isEstimate ? " (estimated)" : ""
                              }`
                              : `$${shippingEstimate.cost.toLocaleString()}${shippingEstimate.isEstimate ? " (estimated)" : ""
                              }`
                          : "Enter ZIP code for shipping estimate"}
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
