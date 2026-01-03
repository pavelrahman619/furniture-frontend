"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { useContactForms } from "@/hooks/useContactForms";
import {
  Loader2,
  Mail,
  User,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

const TABLE_HEIGHT = "calc(100vh - 300px)";
const MESSAGE_TRUNCATE_LENGTH = 50;

export default function ContactPage() {
  const { data: contactForms, isLoading, error, refetch } = useContactForms();
  console.log(contactForms);

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const truncateMessage = (
    message: string,
    length: number = MESSAGE_TRUNCATE_LENGTH
  ) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + "...";
  };

  return (
    <AdminGuard>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-gray-700 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">
                    Contact Forms
                  </h1>
                  {isLoading && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 ml-3" />
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  View and manage customer contact form submissions
                </p>
              </div>
              {error && (
                <button
                  onClick={() => refetch()}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 transition-colors"
                  title="Retry loading contact forms"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 mb-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load contact forms
                </h3>
                <p className="text-gray-600 mb-4">
                  {error instanceof Error
                    ? error.message.includes("authentication") ||
                      error.message.includes("Unauthorized")
                      ? "Authentication required. Please log in again."
                      : error.message
                    : "An error occurred while loading contact forms"}
                </p>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Contact Forms Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Loading contact forms...
                  </span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto relative">
              {/* Fixed Header */}
              <table className="w-full table-fixed">
                <colgroup>
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "15%" }} />
                  <col style={{ width: "27%" }} />
                  <col style={{ width: "15%" }} />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Date
                    </th>
                  </tr>
                </thead>
              </table>

              {/* Scrollable Body */}
              <div className="overflow-y-auto" style={{ height: TABLE_HEIGHT }}>
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "27%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contactForms && contactForms.length > 0
                      ? contactForms.map((form) => {
                          const formId = form._id || form.id || "";
                          const isHovered = hoveredMessageId === formId;
                          const messageIsLong =
                            form.message.length > MESSAGE_TRUNCATE_LENGTH;

                          return (
                            <tr key={formId} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <User className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900">
                                      {form.first_name} {form.last_name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <a
                                  href={`mailto:${form.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  {form.email}
                                </a>
                              </td>
                              <td className="px-6 py-4">
                                {form.phone_number ? (
                                  <div className="flex items-center text-sm text-gray-900">
                                    <Phone className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                    <a
                                      href={`tel:${form.phone_number}`}
                                      className="hover:text-blue-600"
                                    >
                                      {form.phone_number}
                                    </a>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400 italic">
                                    N/A
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className="relative group"
                                  onMouseEnter={() =>
                                    setHoveredMessageId(formId)
                                  }
                                  onMouseLeave={() => setHoveredMessageId(null)}
                                >
                                  <div className="text-sm text-gray-900">
                                    {isHovered && messageIsLong
                                      ? form.message
                                      : truncateMessage(form.message)}
                                  </div>
                                  {isHovered && messageIsLong && (
                                    <div className="absolute z-20 left-0 top-full mt-2 p-3 bg-gray-900 text-white text-sm rounded-md shadow-lg max-w-md whitespace-pre-wrap break-words">
                                      {form.message}
                                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-start text-sm text-gray-900">
                                  <Calendar className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div>{formatDate(form.created_at)}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      : !isLoading && (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                              <div className="text-gray-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  No contact forms found
                                </h3>
                                <p>No contact form submissions yet.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                  </tbody>
                </table>
              </div>

              {/* Results summary */}
              {!isLoading &&
                !error &&
                contactForms &&
                contactForms.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Showing {contactForms.length} contact form
                      {contactForms.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
