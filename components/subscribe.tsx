"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const SubscribeComponent = ({
  priceId,
  price,
  description,
}: {
  priceId: string;
  price: string;
  description: string;
}) => {
  const handleSubmit = async () => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
    const response = await axios.post("/api/stripe/checkout", { priceId });
    await stripe!.redirectToCheckout({ sessionId: response.data.id });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          ${price}
          <span className="text-sm text-gray-500 font-normal"> /month</span>
        </p>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit}>
          Subscribe Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SubscribeComponent;
