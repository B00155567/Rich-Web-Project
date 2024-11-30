import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  console.log("In the login API page");

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  const dbName = "app";

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");

    console.log(`Querying for username: ${username}`);
    const findResult = await collection.findOne({ username: username });
    if (!findResult || findResult.pass !== pass) {
      console.log("Invalid username or password");
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid username or password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const session = await getCustomSession();
    session.role = findResult.role || "customer";
    session.email = username;
    await session.save();

    console.log("Session saved successfully:", { role: session.role, email: session.email });

    return new Response(
      JSON.stringify({ valid: true, role: session.role }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in login API:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close();
  }
}
