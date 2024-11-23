import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  console.log("In the login API page");

  // Extract username and password from query parameters
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");

  console.log("Received credentials:", { username, pass });

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  const dbName = "app"; // Database name

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db(dbName);
    const collection = db.collection("users"); // Correct collection name

    // Query the users collection for the provided username
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

    // Save session data
    const session = await getCustomSession();
    session.role = findResult.role || "customer"; // Assign role or default to 'customer'
    session.email = username; // Store username in session
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
    console.log("Database connection closed.");
  }
}