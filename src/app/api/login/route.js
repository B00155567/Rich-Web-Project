import { MongoClient } from "mongodb";
import { getCustomSession } from "../sessionCode.js";
import bcrypt from "bcrypt";

export async function GET(req) {
  console.log("In the login API page");

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");

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

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  const dbName = "app";

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");

    console.log(`Querying for username: ${username}`);
    const findResult = await collection.findOne({ username: username });

    if (!findResult) {
      console.log("User not found");
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid username or password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Compare the hashed password in the database with the plain text password
    const isPasswordValid = bcrypt.compareSync(pass, findResult.pass);
    if (!isPasswordValid) {
      console.log("Invalid password");
      return new Response(
        JSON.stringify({ valid: false, message: "Invalid username or password." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize or retrieve the session
    const session = await getCustomSession();
    console.log("Session before setting values:", session);

    // Set session properties
    session.role = findResult.acc_type || "customer"; // Default role is "customer"
    session.email = username;
    await session.save();

    console.log("Session after saving:", session);

    // Send a response with the user role
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
