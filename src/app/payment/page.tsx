"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Lock, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  // process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  // "pk_live_51S0SM9Jv8YEVxzjkmVw2GvfgRhNNJnDEP7sQGe8GLTB4ZJjZk1CRIzo3UBYAgf5Bjb7EOzpAGbrgm6VYoV5aImOA00gqyEXMHR"
  "pk_test_51S0SMNFDRNmrCGwdH1uLusw0eFDEQNPsFiqsaNmp4xUvRAEkvSFl7kqbZr2iUu6xsFpck50aVjFRvLFi43DKAnqF00Q65FiDfJ"
);

interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  firstName?: string;
  lastName?: string;
}

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
  name: string;
}

interface OrderData {
  items: OrderItem[];
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  customer_email: string;
  customer_phone: string;
  delivery_cost: number;
  distance_miles: number;
  delivery_zone_validated: boolean;
  subtotal: number;
  total: number;
  amount: number;
}

interface PaymentFormProps {
  clientSecret: string;
  orderData: OrderData;
  total: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  orderData,
  total,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError("Card element not found");
      setProcessing(false);
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: orderData.customer_email,
              email: orderData.customer_email,
              phone: orderData.customer_phone,
              address: {
                line1:
                  orderData.billing_address?.street ||
                  orderData.shipping_address?.street,
                city:
                  orderData.billing_address?.city ||
                  orderData.shipping_address?.city,
                state:
                  orderData.billing_address?.state ||
                  orderData.shipping_address?.state,
                postal_code:
                  orderData.billing_address?.zip_code ||
                  orderData.shipping_address?.zip_code,
                country: "US",
              },
            },
          },
        }
      );

      if (error) {
        setError(error.message || "Payment failed");
        setProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        setPaymentSucceeded(true);

        // Confirm payment with backend and create order
        try {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
            }/api/payments/confirm`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_intent_id: paymentIntent.id,
                order_data: orderData,
              }),
            }
          );

          const result = await response.json();

          if (response.ok && result.success) {
            // Redirect to order success page
            router.push(`/order-success?orderId=${result.order_id}`);
          } else {
            throw new Error(result.message || "Failed to create order");
          }
        } catch (backendError) {
          console.error("Backend confirmation error:", backendError);
          setError(
            "Payment succeeded but order creation failed. Please contact support."
          );
        }

        setProcessing(false);
      }
    } catch (paymentError) {
      console.error("Payment error:", paymentError);
      setError("An unexpected error occurred");
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: "#9e2146",
      },
    },
    hidePostalCode: true,
  };

  if (paymentSucceeded) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-medium text-green-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-green-600">Your order is being processed...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md px-4 py-4 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 px-6 font-medium tracking-wider transition-colors ${
          !stripe || processing
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-gray-900 hover:bg-gray-800 text-white"
        }`}
      >
        {processing
          ? "PROCESSING PAYMENT..."
          : `PAY $${total.toLocaleString()}`}
      </button>

      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Lock className="h-4 w-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
};

function PaymentPageContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Get order data from session storage or URL params
    const storedOrderData = sessionStorage.getItem("pendingOrder");
    if (!storedOrderData) {
      router.push("/checkout");
      return;
    }

    try {
      const parsedOrderData = JSON.parse(storedOrderData) as OrderData;
      setOrderData(parsedOrderData);
      setTotal(parsedOrderData.amount || 0);

      // Create payment intent
      createPaymentIntent(parsedOrderData);
    } catch (error) {
      console.error("Error parsing order data:", error);
      setError("Invalid order data. Please try again.");
      setLoading(false);
    }
  }, [router]);

  const createPaymentIntent = async (orderData: OrderData) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/payments/create-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: orderData.amount,
            currency: "usd",
            order_data: orderData,
            customer_email: orderData.customer_email,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setClientSecret(result.client_secret);
      } else {
        throw new Error(result.message || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      setError("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your payment...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-600 mb-4">{error}</p>
              <Link
                href="/checkout"
                className="inline-block bg-gray-900 text-white px-6 py-3 font-medium tracking-wider hover:bg-gray-800 transition-colors"
              >
                BACK TO CHECKOUT
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!clientSecret || !orderData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/checkout"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checkout
          </Link>
          <h1 className="text-4xl font-light text-gray-900 tracking-wider">
            SECURE PAYMENT
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-gray-600" />
                <h2 className="text-2xl font-light text-gray-900 tracking-wider">
                  PAYMENT INFORMATION
                </h2>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  orderData={orderData}
                  total={total}
                />
              </Elements>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-light text-gray-900 tracking-wider mb-4">
                ORDER SUMMARY
              </h3>

              <div className="space-y-3 mb-6">
                {orderData.items?.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-gray-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ${orderData.subtotal?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">
                    $
                    {(
                      total -
                      (orderData.subtotal || 0) -
                      (orderData.delivery_cost || 0)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Lock className="h-4 w-4" />
                  <span>256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment page...</p>
            </div>
          </div>
        </main>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
