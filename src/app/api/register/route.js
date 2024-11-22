import { getCustomSession } from "../sessionCode.js";
const { MongoClient } = require("mongodb");

export async function GET(req, res) {
  console.log("in the register API page");

  // Get the values sent in the request
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const pass = searchParams.get("pass");
  const firstName = searchParams.get("firstName");
  const secondName = searchParams.get("secondName");
  const address = searchParams.get("address");
  const tel = searchParams.get("tel");

  if (!email || !pass || !firstName || !secondName || !address || !tel) {
    return res.json({
      success: false,
      message: "Invalid request. Missing required fields.",
    });
  }

  console.log("Received registration data:", { email, pass, firstName, secondName, address, tel });

  // Connect to MongoDB
  const url = process.env.DB_ADDRESS;
  const client = new MongoClient(url);
  await client.connect();
  console.log("Connected successfully to server");

  const db = client.db("app"); // Database name
  const collection = db.collection("users"); // Collection name
  
  // Check if the email already exists
  const existingUser = await collection.findOne({ email: email });
  if (existingUser) {
    return res.json({
      success: false,
      message: "Email already in use.",
    });
  }

  // Insert the new user
  const newUser = { email, pass, firstName, secondName, address, tel };
  await collection.insertOne(newUser);

  // Close the connection
  await client.close();

  return res.json({
    success: true,
    message: "Registration successful.",
  });
}