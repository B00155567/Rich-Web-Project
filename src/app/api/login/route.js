import { MongoClient } from 'mongodb';
import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  console.log("In the register API page");

  // Extract email and password from query parameters
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const pass = searchParams.get('pass');

  console.log("Received credentials:", { email, pass });

  // ==========================================================
  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  const dbName = 'app'; // database name

  try {
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('login'); // collection name

    // Check if user exists with the provided email and validate credentials
    const findResult = await collection.find({ "username": email }).toArray();
    console.log('Found documents =>', findResult);

    let valid = false;

    if (findResult.length > 0) {
      valid = true;
      console.log("Login valid");

      // Save session data
      const session = await getCustomSession();
      session.role = "customer"; // Set user role
      session.email = email; // Store the email in session
      await session.save(); // Save the session

      console.log("Session saved successfully:", { role: session.role, email: session.email });
    } else {
      valid = false;
      console.log("Login invalid");
    }

    // ==========================================================
    // Return the response
    return new Response(
      JSON.stringify({ valid }),
      {
        status: valid ? 200 : 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in login API:", error);

    // Handle errors gracefully
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    await client.close(); // Ensure the DB connection is closed
    console.log("Database connection closed.");
  }
}
