import { getCustomSession } from "../sessionCode.js";
import { MongoClient } from "mongodb";

export async function GET(req) {
  console.log("Fetching cart items...");
  
  const session = await getCustomSession();
  if (!session || !session.email) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized access." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const email = session.email;
  console.log("Session email:", email);

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("app");
    const collection = db.collection("cart");

    // Fetch items matching the logged-in user email
    const cartItems = await collection.find({ username: email }).toArray();
    console.log("Cart items fetched:", cartItems);

    return new Response(
      JSON.stringify({ success: true, cart: cartItems }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch cart items." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}
