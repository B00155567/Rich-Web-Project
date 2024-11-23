import { MongoClient } from "mongodb";

export async function GET(req) {
  console.log("In the register API page");

  // Get the values sent in the request
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");
  const firstName = searchParams.get("firstName");
  const secondName = searchParams.get("secondName");
  const address = searchParams.get("address");
  const tel = searchParams.get("tel");

  if (!username || !pass || !firstName || !secondName || !address || !tel) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid request. Missing required fields.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  console.log("Received registration data:", {
    username,
    pass,
    firstName,
    secondName,
    address,
    tel,
  });

  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("app"); // Database name
    const collection = db.collection("users"); // Collection name

    // Check if the email already exists
    const existingUser = await collection.findOne({ username: username });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email already in use.",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert the new user
    const newUser = { username, pass, firstName, secondName, address, tel };
    const insertResult = await collection.insertOne(newUser);
    console.log("User inserted:", insertResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful.",
        redirect: "/login", // Redirect to login page
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in register API:", error);

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
    console.log("Database connection closed.");
  }
}
