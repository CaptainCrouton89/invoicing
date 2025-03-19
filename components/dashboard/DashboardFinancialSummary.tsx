"use client";

import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FinancialSummary = {
  outstanding: number;
  overdue: number;
  paid_last_30_days: number;
  paid_last_90_days: number;
  total_this_year: number;
  draft_total: number;
};

export default function DashboardFinancialSummary() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    async function fetchFinancialSummary() {
      try {
        const response = await fetch("/api/dashboard/financial-summary");
        if (!response.ok) {
          throw new Error("Failed to fetch financial summary");
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Error fetching financial summary:", error);
        toast.error("Error loading financial data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFinancialSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No financial data available
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Outstanding
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(summary.outstanding)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Overdue
          </p>
          <p className="text-lg font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(summary.overdue)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Last 30 days
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(summary.paid_last_30_days)}
          </p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Last 90 days
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(summary.paid_last_90_days)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              This Year
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.total_this_year)}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">Drafts:</span>{" "}
              {formatCurrency(summary.draft_total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
