import DashboardActionAlerts from "@/components/dashboard/DashboardActionAlerts";
import DashboardFinancialSummary from "@/components/dashboard/DashboardFinancialSummary";
import DashboardFrequentClients from "@/components/dashboard/DashboardFrequentClients";
import DashboardInvoiceManagement from "@/components/dashboard/DashboardInvoiceManagement";
import DashboardQuickInvoice from "@/components/dashboard/DashboardQuickInvoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

export default async function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Alerts Section */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle>Action Needed</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense
                fallback={
                  <div className="p-6 text-center">Loading alerts...</div>
                }
              >
                <DashboardActionAlerts />
              </Suspense>
            </CardContent>
          </Card>

          {/* Invoice Management Section */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense
                fallback={
                  <div className="p-6 text-center">Loading invoices...</div>
                }
              >
                <DashboardInvoiceManagement />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3 width on large screens) */}
        <div className="space-y-6">
          <DashboardQuickInvoice />

          {/* Frequent Clients Section */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle>Frequent Clients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense
                fallback={
                  <div className="p-6 text-center">Loading clients...</div>
                }
              >
                <DashboardFrequentClients />
              </Suspense>
            </CardContent>
          </Card>

          {/* Financial Summary Section */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense
                fallback={
                  <div className="p-6 text-center">
                    Loading financial data...
                  </div>
                }
              >
                <DashboardFinancialSummary />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
