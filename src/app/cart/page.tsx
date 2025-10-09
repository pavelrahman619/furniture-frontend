"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";

// Extended cart item interface for display purposes
interface ExtendedCartItem extends CartItem {
  fabric?: string;
  depth?: string;
  width?: string;
  color?: string;
  memberPrice?: number;
  regularPrice?: number;
  deliveryDate?: string;
  isSpecialOrder?: boolean;
}

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice } =
    useCart();
  const router = useRouter();

  const [showMemberSavings, setShowMemberSavings] = useState(true);

  // Convert basic cart items to extended format for display
  const extendedCartItems: ExtendedCartItem[] = cartItems.map((item) => ({
    ...item,
    fabric: "Performance Linen Weave", // Default values for demo
    depth: "Classic",
    width: "Standard",
    color: "Natural",
    memberPrice: Math.round(item.price * 0.7), // 30% member discount
    regularPrice: item.price,
    deliveryDate: "Available for delivery",
    isSpecialOrder: item.availability === "on-order",
  }));

  const totalSavings = extendedCartItems.reduce((total, item) => {
    const memberPrice = item.memberPrice || item.price;
    const regularPrice = item.regularPrice || item.price;
    return total + (regularPrice - memberPrice) * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cart Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-light text-gray-900 tracking-wider mb-8">
            CART
          </h1>

          {/* Membership Program Section */}
          {showMemberSavings && (
            <div className="bg-white border border-gray-200 p-6 mb-8">
              <div className="text-center mb-6">
                <p className="text-gray-700 mb-4">
                  The <span className="underline">RH MEMBERS PROGRAM</span> has
                  been added to your cart. You&apos;ll save{" "}
                  <span className="font-semibold">
                    ${totalSavings.toLocaleString()}
                  </span>{" "}
                  on this order.
                </p>

                <button className="border border-gray-400 px-8 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4">
                  ACCOUNT / MEMBER SIGN IN
                </button>

                <div>
                  <button
                    onClick={() => setShowMemberSavings(false)}
                    className="text-sm text-gray-600 underline hover:text-gray-800 transition-colors"
                  >
                    Remove Member Savings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items */}
          <div className="space-y-8">
            {extendedCartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Product Image */}
                  <div className="lg:col-span-4">
                    <div className="aspect-[4/3] relative bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="lg:col-span-5 space-y-4">
                    <h3 className="text-2xl font-light text-gray-900 tracking-wider">
                      {item.name}
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500 uppercase">FABRIC</span>
                        <span className="text-gray-900">{item.fabric}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500 uppercase">DEPTH</span>
                        <span className="text-gray-900">{item.depth}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500 uppercase">WIDTH</span>
                        <span className="text-gray-900">{item.width}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500 uppercase">COLOR</span>
                        <span className="text-gray-900">{item.color}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4">
                        <span className="text-gray-500 uppercase">ITEM#</span>
                        <span className="text-gray-900">{item.sku}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Pricing */}
                  <div className="lg:col-span-3 space-y-6">
                    {/* Quantity Selector */}
                    <div className="relative">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.cartId, parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 px-4 py-2 bg-white text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <div className="text-2xl font-light text-gray-900">
                        ${(item.memberPrice || item.price).toLocaleString()}{" "}
                        <span className="text-sm">Member</span>
                      </div>
                      <div className="text-sm text-gray-500 line-through">
                        ${(item.regularPrice || item.price).toLocaleString()}{" "}
                        Regular
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="text-xs text-gray-600 space-y-2">
                      <p>
                        This item is special order and will be ready for
                        delivery between {item.deliveryDate}
                      </p>
                      <p>Ships via Unlimited Furniture Delivery</p>
                      <p>
                        This item is special order and cannot be returned.{" "}
                        <Link
                          href="#"
                          className="underline hover:text-gray-800"
                        >
                          Learn more about our Return Policy
                        </Link>
                      </p>
                    </div>

                    {/* Terms and Remove */}
                    <div className="text-xs text-gray-600 space-y-2">
                      <p>
                        <Link
                          href="#"
                          className="underline hover:text-gray-800"
                        >
                          Terms of sale
                        </Link>{" "}
                        accepted.
                      </p>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-gray-600 underline hover:text-gray-800 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Section */}
          {cartItems.length > 0 && (
            <div className="bg-white border border-gray-200 p-8 mt-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Subtotal:</span>
                <span className="text-2xl font-light">
                  ${getTotalPrice().toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                <span>Member Savings:</span>
                <span>-${totalSavings.toLocaleString()}</span>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-gray-900 text-white py-4 px-8 font-medium tracking-wider hover:bg-gray-800 transition-colors"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}

          {/* Empty Cart Message */}
          {cartItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <Link
                href="/products"
                className="inline-block mt-4 bg-gray-900 text-white px-8 py-3 font-medium tracking-wider hover:bg-gray-800 transition-colors"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default CartPage;
