import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);

  try {
    // Validate admin session
    const session = await getCustomSession();
    if (!session || session.role !== "admin") {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await client.connect();
    const db = client.db("app");
    const cartCollection = db.collection("cart");

    // Fetch all cart data grouped by username
    const cartData = await cartCollection
      .aggregate([
        {
          $group: {
            _id: "$username",
            orders: {
              $push: {
                pname: "$pname",
                quantity: "$quantity",
              },
            },
          },
        },
      ])
      .toArray();

    return new Response(JSON.stringify({ success: true, data: cartData }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await client.close();
  }
}
