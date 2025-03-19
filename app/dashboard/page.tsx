import DashboardActionAlerts from "@/components/dashboard/DashboardActionAlerts";
import DashboardFinancialSummary from "@/components/dashboard/DashboardFinancialSummary";
import DashboardFrequentClients from "@/components/dashboard/DashboardFrequentClients";
import DashboardInvoiceManagement from "@/components/dashboard/DashboardInvoiceManagement";
import DashboardQuickInvoice from "@/components/dashboard/DashboardQuickInvoice";
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Alerts Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-lg">Action Needed</h2>
            </div>
            <Suspense
              fallback={
                <div className="p-6 text-center">Loading alerts...</div>
              }
            >
              <DashboardActionAlerts />
            </Suspense>
          </section>

          {/* Invoice Management Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-lg">Recent Invoices</h2>
            </div>
            <Suspense
              fallback={
                <div className="p-6 text-center">Loading invoices...</div>
              }
            >
              <DashboardInvoiceManagement />
            </Suspense>
          </section>
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Quick Invoice Creation Widget */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-lg">Quick Invoice</h2>
            </div>
            <Suspense
              fallback={<div className="p-6 text-center">Loading...</div>}
            >
              <DashboardQuickInvoice />
            </Suspense>
          </section>

          {/* Frequent Clients Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-lg">Frequent Clients</h2>
            </div>
            <Suspense
              fallback={
                <div className="p-6 text-center">Loading clients...</div>
              }
            >
              <DashboardFrequentClients />
            </Suspense>
          </section>

          {/* Financial Summary Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-medium text-lg">Financial Summary</h2>
            </div>
            <Suspense
              fallback={
                <div className="p-6 text-center">Loading financial data...</div>
              }
            >
              <DashboardFinancialSummary />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
