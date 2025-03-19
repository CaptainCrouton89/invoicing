"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteInvoiceButton from "./DeleteInvoiceButton";

interface InvoiceActionsProps {
  invoiceId: string;
  showLabels?: boolean;
}

export default function InvoiceActions({
  invoiceId,
  showLabels = false,
}: InvoiceActionsProps) {
  const router = useRouter();

  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" size="sm" className="h-8" asChild>
        <Link href={`/invoices/${invoiceId}`}>{showLabels ? "View" : ""}</Link>
      </Button>
      <Button variant="outline" size="sm" className="h-8" asChild>
        <Link href={`/invoices/${invoiceId}/edit`}>
          {showLabels ? "Edit" : ""}
        </Link>
      </Button>
      <DeleteInvoiceButton
        invoiceId={invoiceId}
        size="sm"
        onDelete={() => router.refresh()}
      />
    </div>
  );
}
