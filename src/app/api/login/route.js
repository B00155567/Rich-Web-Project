import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode.js";
import bcrypt from "bcrypt";

export async function GET(req) {
  console.log("In the login API page");

  // Extract parameters from the request URL
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");

  // Check for missing fields
  if (!username || !pass) {
    console.log("Missing username or password");
    return new Response(
      JSON.stringify({ valid: false, message: "Username and password are required." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log(`Received login attempt for username: ${username}`);

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  const dbName = "app";

  try {
    // Connect to the database
    console.log("Connecting to the database...");
    await client.connect();
    console.log("Database connection successful.");

    const db = client.db(dbName);
    const collection = db.collection("users");

    // Query the database for the username
    console.log(`Querying for username: ${username}`);
    const findResult = await collection.findOne({ username: username });

    if (!findResult) {
      console.log(`User not found for username: ${username}`);
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid username or password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("User found:", findResult);

    // Validate the password
    console.log("Validating password...");
    const isPasswordValid = bcrypt.compareSync(pass, findResult.pass);
    if (!isPasswordValid) {
      console.log(`Password mismatch for username: ${username}`);
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid username or password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Password validated successfully.");

    // Initialize or retrieve the session
    console.log("Initializing session...");
    const session = await getCustomSession();
    console.log("Session before setting values:", session);

    // Set session properties
    session.role = findResult.acc_type || "customer"; // Default role is "customer"
    session.email = username;
    await session.save();

    console.log("Session saved successfully:", session);

    // Respond with success and user role
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
    // Close the database connection
    await client.close();
    console.log("Database connection closed.");
  }
}
