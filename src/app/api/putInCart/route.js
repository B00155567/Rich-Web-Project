import { getCustomSession } from "../sessionCode.js";
const { MongoClient } = require("mongodb");

export async function GET(req) {
  console.log("In the putInCart API page");

  const url = process.env.DB_ADDRESS; // MongoDB connection string
  const client = new MongoClient(url);
  const dbName = "app"; // Database name

  try {
    // Validate the session
    const session = await getCustomSession();
    if (!session || !session.email) {
      console.log("Unauthorized access attempt");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please log in to add items to your cart.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Session validated for:", session.email);

    // Get the product name from the request
    const { searchParams } = new URL(req.url);
    const pname = searchParams.get("pname");

    if (!pname) {
      console.log("Invalid request: Missing product name");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request: Missing product name.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Product name:", pname);

    // Connect to MongoDB
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("cart");

    // Add or update the product in the cart
    const updateResult = await collection.updateOne(
      { pname, username: session.email },
      { $inc: { quantity: 1 } }, // Increment quantity by 1
      { upsert: true }           // Insert if the item doesn't exist
    );

    console.log("Item added to cart:", updateResult);

    // Respond to the client
    return new Response(
      JSON.stringify({
        success: true,
        message: "Item added to cart successfully.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in putInCart API:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
    console.log("Database connection closed");
  }
}
