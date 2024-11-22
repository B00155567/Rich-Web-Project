import { getCustomSession } from "../sessionCode.js";
const { MongoClient } = require("mongodb");

export async function GET(req, res) {
  console.log("in the putInCart API page");

  // Validate the session
  const session = await getCustomSession();
  if (!session || !session.email) {
    // No session or user is not logged in
    return Response.json({
      success: false,
      message: "Unauthorized: Please log in to add items to your cart.",
    });
  }

  console.log("Session validated for:", session.email);

  // Get the values sent in the request
  const { searchParams } = new URL(req.url);
  const pname = searchParams.get("pname");

  if (!pname) {
    return Response.json({
      success: false,
      message: "Invalid request. Missing product name.",
    });
  }

  console.log("Product name:", pname);

  // Connect to MongoDB
  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected successfully to server");

  const db = client.db("app"); // Database name
  const collection = db.collection("shopping_cart"); // Collection name

  // Insert the product into the cart for the logged-in user
  var myobj = { pname: pname, username: session.email };
  const insertResult = await collection.insertOne(myobj);

  console.log("Item added to cart:", insertResult);

  // Respond to the client
  return Response.json({
    success: true,
    message: "Item added to cart successfully.",
  });
}
