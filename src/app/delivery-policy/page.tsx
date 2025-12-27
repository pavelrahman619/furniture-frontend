export default function DeliveryPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h1 className="text-4xl md:text-5xl font-light tracking-wider text-gray-900 mb-8">
          Delivery Policy
        </h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
          <p className="text-lg leading-relaxed">
            At Palacios Home Co, we strive to provide reliable and timely delivery for every purchase. Please review the following delivery terms before completing your order.
          </p>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                1. Delivery Scheduling
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Delivery dates are estimated and scheduled based on product availability, customer location, and delivery route. While we do our best to meet scheduled dates, delays may occur due to manufacturing timelines, traffic, weather, or other circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                2. Delivery Area & Fees
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Delivery services are available within designated service areas. Delivery fees may vary based on distance, order size, stairs, elevators, or special handling requirements. Any applicable fees will be disclosed prior to delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                3. Customer Responsibilities
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-2">
                Customers are responsible for:
              </p>
              <ul className="list-disc list-inside text-lg text-gray-700 space-y-1 ml-4">
                <li>Ensuring clear and safe access to the delivery location</li>
                <li>Measuring doorways, hallways, staircases, and elevators prior to purchase</li>
                <li>Securing pets and clearing the delivery area</li>
                <li>Being present during the scheduled delivery window</li>
              </ul>
              <p className="text-lg text-gray-700 leading-relaxed mt-3">
                Palacios Home Co is not responsible for items that cannot be delivered due to access limitations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                4. Inspection Upon Delivery
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Customers must inspect all items at the time of delivery. Any visible damage or discrepancies must be noted on the delivery receipt or reported within 48 hours of delivery. Claims reported after this period may not be accepted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                5. Failed or Rescheduled Deliveries
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If delivery cannot be completed due to customer unavailability, incorrect information, or access issues, additional delivery or redelivery fees may apply.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                6. Assembly & Placement
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Basic placement of furniture in the designated room is included unless otherwise stated. Assembly services may be limited and are not included unless specified at the time of purchase.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                7. Liability & Limitations
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Palacios Home Co is not responsible for damage to floors, walls, door frames, or personal property resulting from standard delivery conditions, narrow spaces, or pre-existing conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light tracking-wide text-gray-900 mb-3">
                8. Special Orders
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Special or custom-order items follow manufacturer timelines and are subject to separate delivery schedules. These items may not be eligible for cancellation once ordered.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

