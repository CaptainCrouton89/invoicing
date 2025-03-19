"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useSupabase } from "@/utils/supabase/use-supabase";
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
  const { supabase, user } = useSupabase();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);

  useEffect(() => {
    async function fetchFinancialSummary() {
      try {
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get current date and other date references
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        // Calculate date 30 days ago
        const date30DaysAgo = new Date();
        date30DaysAgo.setDate(today.getDate() - 30);
        const date30DaysAgoStr = date30DaysAgo.toISOString().split("T")[0];

        // Calculate date 90 days ago
        const date90DaysAgo = new Date();
        date90DaysAgo.setDate(today.getDate() - 90);
        const date90DaysAgoStr = date90DaysAgo.toISOString().split("T")[0];

        // Calculate start of year
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const startOfYearStr = startOfYear.toISOString().split("T")[0];

        // Get all invoices for the current user
        const { data: invoices, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          throw new Error("Failed to fetch invoice data");
        }

        // Calculate financial summary
        const financialSummary = {
          outstanding: 0, // All sent but not paid
          overdue: 0, // Past due date and not paid
          paid_last_30_days: 0,
          paid_last_90_days: 0,
          total_this_year: 0,
          draft_total: 0,
        };

        invoices.forEach((invoice) => {
          // Draft invoices
          if (invoice.status === "draft") {
            financialSummary.draft_total += invoice.total_amount || 0;
          }

          // Outstanding invoices (sent but not paid)
          if (invoice.status === "sent") {
            financialSummary.outstanding += invoice.total_amount || 0;

            // Check if overdue
            if (invoice.due_date < todayStr) {
              financialSummary.overdue += invoice.total_amount || 0;
            }
          }

          // Paid invoices
          if (invoice.status === "paid") {
            // Check if paid in last 30 days
            if (invoice.paid_date && invoice.paid_date >= date30DaysAgoStr) {
              financialSummary.paid_last_30_days += invoice.total_amount || 0;
            }

            // Check if paid in last 90 days
            if (invoice.paid_date && invoice.paid_date >= date90DaysAgoStr) {
              financialSummary.paid_last_90_days += invoice.total_amount || 0;
            }

            // Check if paid this year
            if (invoice.paid_date && invoice.paid_date >= startOfYearStr) {
              financialSummary.total_this_year += invoice.total_amount || 0;
            }
          }
        });

        setSummary(financialSummary);
      } catch (error) {
        console.error("Error fetching financial summary:", error);
        toast.error("Error loading financial data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFinancialSummary();
  }, [supabase, user]);

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
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Outstanding
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.outstanding)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Overdue
            </p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(summary.overdue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Last 30 days
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.paid_last_30_days)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Last 90 days
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.paid_last_90_days)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
