import { getCustomSession } from "../sessionCode.js";
import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    // Validate session
    const session = await getCustomSession();
    console.log("Session data:", session);
    if (!session || !session.email) {
      console.error("User not logged in or session missing.");
      return new Response(
        JSON.stringify({ success: false, message: "User not logged in." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Invalid JSON in request body:", error.message);
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Checkout request body:", body);

    const items = body.cartItems;
    if (!items || items.length === 0) {
      console.error("Cart is empty or missing.");
      return new Response(
        JSON.stringify({ success: false, message: "Cart is empty." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to MongoDB
    const mongoUrl = process.env.DB_ADDRESS;
    const client = new MongoClient(mongoUrl);
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db("app");
    const cartCollection = db.collection("cart");

    // Remove the user's cart items
    const deleteResult = await cartCollection.deleteMany({ username: session.email });
    console.log(`Deleted ${deleteResult.deletedCount} items from cart for user: ${session.email}`);

    // Confirm the order placement
    console.log(`Order placed successfully for user: ${session.email}`);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: "Order placed successfully." }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error during checkout:", error.message, error.stack);
    return new Response(
      JSON.stringify({ success: false, message: "Internal Server Error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
