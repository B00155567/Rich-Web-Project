import { getCustomSession } from "../sessionCode.js";
import { MongoClient, ObjectId } from "mongodb";

export async function PATCH(req) {
  try {
    console.log("Processing PATCH /api/decreaseQuantity");

    // Extract item ID from the request URL
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      console.error("Item ID not provided in the request");
      return new Response(
        JSON.stringify({ success: false, error: "Item ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Received item ID:", id);

    // Validate session
    const session = await getCustomSession();
    if (!session || !session.email) {
      console.error("Unauthorized access: no valid session found");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Session email:", session.email);

    // Connect to MongoDB
    const url = process.env.DB_ADDRESS;
    const client = new MongoClient(url);
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("app");
    const collection = db.collection("cart");

    // Check if the item exists for the logged-in user
    const item = await collection.findOne({ _id: new ObjectId(id), username: session.email });
    console.log("Item fetched from database:", item);

    if (!item) {
      console.error("Item not found or not authorized");
      await client.close();
      return new Response(
        JSON.stringify({ success: false, error: "Item not found or not authorized" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decrease the item's quantity by 1
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(id), username: session.email },
      { $inc: { quantity: -1 } }
    );
    console.log("Quantity updated:", updateResult);

    // Remove the item if the quantity becomes 0
    if (item.quantity - 1 <= 0) {
      const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
      console.log("Item removed from cart:", deleteResult);
    }

    await client.close();
    console.log("Database connection closed");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in decreaseQuantity API:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
