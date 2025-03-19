"use client";
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
    <div>
      <button onClick={handleSubmit}>{description}</button>
    </div>
  );
};

export default SubscribeComponent;
