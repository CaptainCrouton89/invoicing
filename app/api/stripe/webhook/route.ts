import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      sig!,
      process.env.STRIPE_SECRET_WEBHOOK_KEY!
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    return Response.json(
      { error: "An unknown error occurred" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Fulfill the purchase like saving the session info to the database
  }

  return Response.json({ message: "Received" }, { status: 200 });
}
