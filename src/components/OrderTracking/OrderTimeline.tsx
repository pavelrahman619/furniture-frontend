/**
 * Order Timeline Component
 * Displays detailed timeline of order events
 */

import React from 'react';
import { MapPin } from 'lucide-react';
import type { TimelineEvent } from '@/types/order-tracking.types';
import { formatDate } from '@/lib/order-tracking.utils';

interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-light text-gray-900 tracking-wider">
          ORDER TIMELINE
        </h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {timeline.map((event, index) => {
            const EventIcon = event.icon;
            const isLastEvent = index === timeline.length - 1;

            return (
              <div key={event.id} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 relative">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-500">
                      <EventIcon className="h-5 w-5 text-green-600" />
                    </div>
                    {!isLastEvent && (
                      <div className="absolute top-10 left-1/2 w-0.5 h-8 bg-gray-200 transform -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      {event.description}
                    </p>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

