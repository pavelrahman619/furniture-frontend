"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Truck, Calendar, CreditCard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import OrderService from "@/services/order.service";

// Product image interface
interface ProductImage {
  url: string;
  alt?: string;
  is_primary?: boolean;
}

// Product variant interface
interface ProductVariant {
  _id?: string;
  id?: string;
  sku: string;
  images?: ProductImage[];
  name?: string;
  price?: number;
  stock?: number;
}

// Populated product interface (when product_id is populated)
interface PopulatedProduct {
  _id?: string;
  id?: string;
  sku?: string;
  name?: string;
  description?: string;
  price?: number;
  images?: ProductImage[];
  variants?: ProductVariant[];
  category_ids?: string[];
}

// Backend order item interface
interface BackendOrderItem {
  product_id: PopulatedProduct | string;
  variant_id?: string;
  name: string;
  quantity: number;
  price: number;
}

// Order interfaces matching backend types
interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  sku: string;
}

interface OrderDetails {
  orderNumber: string;
  orderDate: string;
  estimatedDelivery?: string;
  subtotal: number;
  shippingCost: number;
  tax?: number;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string;
}

const OrderSuccessContent = () => {
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        const orderResponse = await OrderService.getOrder(orderId);

        // Check if response has the expected structure
        if (!orderResponse.order) {
          throw new Error('Invalid order response structure');
        }

        const order = orderResponse.order;

        console.log('📦 Order received from backend:', {
          order_id: order._id,
          subtotal: order.subtotal,
          delivery_cost: order.delivery_cost,
          distance_miles: order.distance_miles,
          total: order.total,
          full_order: order
        });

        // Transform backend order data to match our interface
        const transformedOrder: OrderDetails = {
          orderNumber: order._id || orderId,
          orderDate: new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          estimatedDelivery: order.estimated_delivery
            ? new Date(order.estimated_delivery).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "December 15-20, 2024", // Fallback
          subtotal: order.subtotal,
          shippingCost: order.delivery_cost ?? 0,
          tax: order.tax ?? 0,
          total: order.total,
          items: order.items ? order.items.map((item: BackendOrderItem) => {
            // Handle populated product_id (could be object or string)
            const productId = typeof item.product_id === 'object' && item.product_id !== null
              ? (item.product_id._id || item.product_id.id || String(item.product_id))
              : String(item.product_id);
            
            // Get product data if populated
            const product: PopulatedProduct | null = typeof item.product_id === 'object' && item.product_id !== null
              ? item.product_id as PopulatedProduct
              : null;
            
            // Get image from product
            const defaultImageUrl = "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
            let imageUrl = defaultImageUrl;
            
            if (product) {
              // Debug logging (remove in production)
              console.log('Product data:', {
                productId,
                variantId: item.variant_id,
                product: product,
                hasVariants: !!product.variants,
                variantsCount: product.variants?.length || 0,
                variants: product.variants,
                hasImages: !!product.images,
                imagesCount: product.images?.length || 0,
                images: product.images,
              });
              
              // Normalize variant_id to string for comparison
              const variantIdStr = item.variant_id ? String(item.variant_id) : null;
              
              // Try to get image from variant if variant_id exists
              if (variantIdStr && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                const variant = product.variants.find((v: ProductVariant) => {
                  const vId = v._id ? String(v._id) : (v.id ? String(v.id) : null);
                  return vId === variantIdStr;
                });
                
                console.log('Variant match:', { 
                  variantIdStr, 
                  foundVariant: !!variant, 
                  variant: variant,
                  variantImages: variant?.images?.length || 0,
                  variantImagesArray: variant?.images 
                });
                
                if (variant && variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
                  // Get first available image (primary first, then first image)
                  const primaryImage = variant.images.find((img: ProductImage) => img.is_primary);
                  imageUrl = primaryImage?.url || variant.images[0]?.url || defaultImageUrl;
                  console.log('Using variant image:', imageUrl);
                }
              }
              
              // If variant match failed or no variant_id, try first variant's image
              if (imageUrl === defaultImageUrl && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                const firstVariant = product.variants[0];
                console.log('Checking first variant:', { firstVariant, hasImages: !!firstVariant?.images, imagesCount: firstVariant?.images?.length });
                if (firstVariant && firstVariant.images && Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
                  const primaryImage = firstVariant.images.find((img: ProductImage) => img.is_primary);
                  imageUrl = primaryImage?.url || firstVariant.images[0]?.url || defaultImageUrl;
                  console.log('Using first variant image:', imageUrl);
                }
              }
              
              // Fallback to product-level images if we still have the default image
              if (imageUrl === defaultImageUrl && product.images && Array.isArray(product.images) && product.images.length > 0) {
                const primaryImage = product.images.find((img: ProductImage) => img.is_primary);
                imageUrl = primaryImage?.url || product.images[0]?.url || defaultImageUrl;
                console.log('Using product-level image:', imageUrl);
              }
            } else {
              console.log('Product not populated or is null');
            }
            
            // Get SKU from product or variant
            let sku = `SKU-${productId}`; // Default fallback
            if (product) {
              // Normalize variant_id to string for comparison
              const variantIdStr = item.variant_id ? String(item.variant_id) : null;
              
              if (variantIdStr && product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
                const variant = product.variants.find((v: ProductVariant) => {
                  const vId = v._id ? String(v._id) : (v.id ? String(v.id) : null);
                  return vId === variantIdStr;
                });
                if (variant && variant.sku) {
                  sku = variant.sku;
                }
              } else if (product.sku) {
                sku = product.sku;
              }
            }
            
            return {
              id: productId,
              name: item.name,
              image: imageUrl,
              quantity: item.quantity,
              price: item.price,
              sku: sku,
            };
          }) : [],
          shippingAddress: {
            name: "Customer", // Backend doesn't store customer name separately
            street: order.shipping_address.street,
            city: order.shipping_address.city,
            state: order.shipping_address.state,
            zip: order.shipping_address.zip_code,
          },
          paymentMethod: order.payment_method || "****",
        };

        setOrderDetails(transformedOrder);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The order could not be loaded.'}</p>
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-8 py-3 font-medium tracking-wider hover:bg-gray-800 transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="text-4xl font-light text-gray-900 tracking-wider mb-4">
            ORDER CONFIRMED
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your order!
          </p>
          <p className="text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Order Number */}
          <div className="bg-white border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Order Number
            </h3>
            <p className="text-xl font-light text-gray-900 tracking-wider">
              {orderDetails.orderNumber}
            </p>
          </div>

          {/* Order Date */}
          <div className="bg-white border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Order Date
            </h3>
            <p className="text-xl font-light text-gray-900">
              {orderDetails.orderDate}
            </p>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-white border border-gray-200 p-6 text-center">
            <div className="flex justify-center mb-4">
              <Truck className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Estimated Delivery
            </h3>
            <p className="text-xl font-light text-gray-900">
              {orderDetails.estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-light text-gray-900 tracking-wider mb-8">
            ORDER DETAILS
          </h2>

          <div className="space-y-6">
            {orderDetails.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-6 pb-6 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 relative bg-gray-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-light text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-1">Item# {item.sku}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-light text-gray-900">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Order Summary */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-light text-gray-900 tracking-wider mb-6">
              ORDER SUMMARY
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">
                  ${orderDetails.subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">
                  {orderDetails.shippingCost === 0
                    ? 'Complimentary'
                    : `$${orderDetails.shippingCost.toLocaleString()}`}
                </span>
              </div>

              {orderDetails.tax !== undefined && orderDetails.tax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">
                    ${orderDetails.tax.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    Total:
                  </span>
                  <span className="text-xl font-light text-gray-900">
                    ${orderDetails.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-light text-gray-900 tracking-wider mb-6">
              SHIPPING & PAYMENT
            </h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Shipping Address
                </h4>
                <div className="text-gray-900">
                  <p>{orderDetails.shippingAddress.name}</p>
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.zip}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Payment Method
                </h4>
                <p className="text-gray-900">
                  Credit Card ending in {orderDetails.paymentMethod}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4 lg:space-y-0 lg:space-x-6 lg:flex lg:justify-center">
          <Link
            href="/track"
            className="inline-block w-full lg:w-auto bg-gray-900 text-white px-8 py-4 font-medium tracking-wider hover:bg-gray-800 transition-colors"
          >
            TRACK YOUR ORDER
          </Link>

          <Link
            href="/products"
            className="inline-block w-full lg:w-auto border border-gray-400 px-8 py-4 font-medium text-gray-700 tracking-wider hover:bg-gray-50 transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-xl font-light text-gray-900 tracking-wider mb-4">
              WHAT&apos;S NEXT?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Order Confirmation
                </h4>
                <p className="text-gray-600 text-sm">
                  You&apos;ll receive an email confirmation with your order
                  details and tracking information.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Preparation
                </h4>
                <p className="text-gray-600 text-sm">
                  Your handcrafted furniture will be carefully prepared and
                  quality-checked before shipping.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Delivery
                </h4>
                <p className="text-gray-600 text-sm">
                  Our white-glove delivery service will bring your furniture
                  directly to your home.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Questions about your order? Contact our customer service team at{" "}
                <Link
                  href="tel:(323) 618-4663"
                  className="underline hover:text-gray-800"
                >
                  (323) 618-4663
                </Link>{" "}
                or{" "}
                <Link
                  href="mailto:info@palacioshomeco.com"
                  className="underline hover:text-gray-800"
                >
                  info@palacioshomeco.com
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const OrderSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
};

export default OrderSuccessPage;
