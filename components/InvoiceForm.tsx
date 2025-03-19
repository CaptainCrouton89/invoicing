"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Database } from "@/lib/database.types";
import { formatCurrency } from "@/lib/utils";
import { useSupabase } from "@/utils/supabase/use-supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type FormMode = "create" | "edit";

interface InvoiceFormProps {
  invoice?: Database["public"]["Tables"]["invoices"]["Row"] & {
    items: Database["public"]["Tables"]["invoice_items"]["Row"][];
  };
  client?: Database["public"]["Tables"]["clients"]["Row"];
  mode: FormMode;
}

export default function InvoiceForm({
  invoice,
  client,
  mode,
}: InvoiceFormProps) {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<
    Database["public"]["Tables"]["clients"]["Row"][]
  >([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [formData, setFormData] = useState<
    Partial<Database["public"]["Tables"]["invoices"]["Row"]>
  >({
    client_id: client?.id || invoice?.client_id || "",
    issue_date: invoice?.issue_date || new Date().toISOString().split("T")[0],
    due_date: invoice?.due_date || "",
    status: invoice?.status || "draft",
    subtotal: invoice?.subtotal || 0,
    tax_amount: invoice?.tax_amount || 0,
    discount_amount: invoice?.discount_amount || 0,
    total_amount: invoice?.total_amount || 0,
    notes: invoice?.notes || "",
  });

  const [items, setItems] = useState<
    Database["public"]["Tables"]["invoice_items"]["Row"][]
  >(invoice?.items || []);

  // Fetch clients
  useEffect(() => {
    async function fetchClients() {
      try {
        if (!user) {
          setIsLoadingClients(false);
          return;
        }

        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .eq("user_id", user.id)
          .order("name", { ascending: true });

        if (error) {
          throw new Error("Failed to fetch clients");
        }

        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast.error("Failed to load clients");
      } finally {
        setIsLoadingClients(false);
      }
    }

    fetchClients();
  }, [supabase, user]);

  // Calculate due date based on client payment terms
  useEffect(() => {
    if (formData.client_id && formData.issue_date) {
      const selectedClient = clients.find((c) => c.id === formData.client_id);

      if (selectedClient?.default_payment_terms) {
        const issueDate = new Date(formData.issue_date);
        const dueDate = new Date(issueDate);
        dueDate.setDate(
          dueDate.getDate() + selectedClient.default_payment_terms
        );

        setFormData((prev) => ({
          ...prev,
          due_date: dueDate.toISOString().split("T")[0],
        }));
      }
    }
  }, [formData.client_id, formData.issue_date, clients]);

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = formData.tax_amount || 0;
    const discountAmount = formData.discount_amount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      total_amount: totalAmount,
    }));
  }, [items, formData.tax_amount, formData.discount_amount]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isAmount = false
  ) => {
    const { name, value } = e.target;
    const numberValue = value === "" ? 0 : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [name]: isAmount ? parseFloat(numberValue.toFixed(2)) : numberValue,
    }));
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const newItems = [...items];

    if (name === "quantity" || name === "unit_price") {
      const numberValue = value === "" ? 0 : parseFloat(value);
      newItems[index] = {
        ...newItems[index],
        [name]: numberValue,
      };

      // Calculate amount
      const quantity =
        name === "quantity" ? numberValue : newItems[index].quantity || 0;
      const unitPrice =
        name === "unit_price" ? numberValue : newItems[index].unit_price || 0;
      newItems[index].amount = parseFloat((quantity * unitPrice).toFixed(2));
    } else {
      newItems[index] = {
        ...newItems[index],
        [name]: value,
      };
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        description: "",
        quantity: 1,
        unit_price: 0,
        amount: 0,
        created_at: null,
        discount: null,
        id: "",
        invoice_id: "",
        tax_rate: null,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }

    if (!formData.client_id) {
      toast.error("Please select a client");
      return;
    }

    if (!formData.issue_date || !formData.due_date) {
      toast.error("Issue date and due date are required");
      return;
    }

    // Validate items
    if (
      items.some(
        (item) => !item.description || !item.quantity || !item.unit_price
      )
    ) {
      toast.error(
        "All invoice items must have a description, quantity, and price"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Get next invoice number from settings if creating a new invoice
      if (mode === "create") {
        // Get settings for invoice prefix and next number
        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("invoice_prefix, next_invoice_number")
          .eq("user_id", user.id)
          .single();

        if (settingsError && settingsError.code !== "PGRST116") {
          throw new Error("Could not retrieve settings");
        }

        // Generate invoice number
        const invoicePrefix = settings?.invoice_prefix || "INV-";
        const nextInvoiceNumber = settings?.next_invoice_number || 1;
        const invoiceNumber = `${invoicePrefix}${String(nextInvoiceNumber).padStart(4, "0")}`;

        // Prepare data
        const invoiceData: Database["public"]["Tables"]["invoices"]["Insert"] =
          {
            ...formData,
            user_id: user.id,
            invoice_number: invoiceNumber,
            status: formData.status || "draft",
            client_id: formData.client_id || "",
            discount_amount: formData.discount_amount || 0,
            due_date: formData.due_date || "",
            issue_date: formData.issue_date || "",
            notes: formData.notes || "",
            subtotal: formData.subtotal || 0,
            tax_amount: formData.tax_amount || 0,
            total_amount: formData.total_amount || 0,
          };

        // Insert invoice
        const { data: newInvoice, error: invoiceError } = await supabase
          .from("invoices")
          .insert(invoiceData)
          .select()
          .single();

        if (invoiceError) {
          throw new Error(invoiceError.message || "Failed to create invoice");
        }

        // Insert invoice items
        if (items.length > 0) {
          const itemsData = items.map((item) => ({
            ...item,
            invoice_id: newInvoice.id,
          }));

          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsData);

          if (itemsError) {
            throw new Error(
              itemsError.message || "Failed to create invoice items"
            );
          }
        }

        // Update next invoice number in settings
        const { error: updateError } = await supabase
          .from("settings")
          .update({ next_invoice_number: nextInvoiceNumber + 1 })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Failed to update next invoice number:", updateError);
          // Continue anyway as the invoice was created successfully
        }

        toast.success("Invoice created successfully");

        // Redirect to invoice view
        router.push(`/invoices/${newInvoice.id}`);
      } else {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from("invoices")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", invoice?.id || "")
          .eq("user_id", user.id);

        if (invoiceError) {
          throw new Error(invoiceError.message || "Failed to update invoice");
        }

        // First delete existing items
        const { error: deleteError } = await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoice?.id || "");

        if (deleteError) {
          throw new Error(
            deleteError.message || "Failed to update invoice items"
          );
        }

        // Then insert new items
        if (items.length > 0) {
          const itemsData = items.map((item) => ({
            ...item,
            invoice_id: invoice?.id || "",
          }));

          const { error: itemsError } = await supabase
            .from("invoice_items")
            .insert(itemsData);

          if (itemsError) {
            throw new Error(
              itemsError.message || "Failed to update invoice items"
            );
          }
        }

        toast.success("Invoice updated successfully");

        // Redirect to invoice view
        router.push(`/invoices/${invoice?.id}`);
      }

      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="client_id">
                Client <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    client_id: value,
                  });
                }}
                disabled={isLoadingClients || Boolean(client)}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status as "draft" | "sent" | "paid"}
                onValueChange={(value: "draft" | "sent" | "paid") => {
                  setFormData({
                    ...formData,
                    status: value,
                  });
                }}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="issue_date">
                Issue Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                required
                value={formData.issue_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="due_date">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                required
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoice Items</CardTitle>
          <Button type="button" onClick={addItem} size="sm" variant="default">
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        name="description"
                        value={item.description || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        placeholder="Item description"
                        className="w-full border-0 p-0 bg-transparent focus:outline-none focus:ring-0"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        name="quantity"
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-20 border-0 focus:outline-none focus:ring-0"
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        name="unit_price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-24 border-0 focus:outline-none focus:ring-0"
                        required
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.amount || 0)}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium">Subtotal:</dt>
                <dd>{formatCurrency(formData.subtotal || 0)}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium mr-4">Tax:</dt>
                <dd className="flex items-center">
                  <Input
                    name="tax_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.tax_amount || ""}
                    onChange={(e) => handleNumberChange(e, true)}
                    className="w-24 text-right"
                  />
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium mr-4">Discount:</dt>
                <dd className="flex items-center">
                  <Input
                    name="discount_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount_amount || ""}
                    onChange={(e) => handleNumberChange(e, true)}
                    className="w-24 text-right"
                  />
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <dt className="font-bold">Total:</dt>
                <dd className="font-bold">
                  {formatCurrency(formData.total_amount || 0)}
                </dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes || ""}
              onChange={handleChange}
              placeholder="Additional notes or terms of service"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end space-x-3">
        <Button type="button" onClick={() => router.back()} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} variant="default">
          {isSubmitting
            ? "Saving..."
            : mode === "create"
              ? "Create Invoice"
              : "Update Invoice"}
        </Button>
      </div>
    </form>
  );
}
