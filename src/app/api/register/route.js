import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import validator from "email-validator";

export async function GET(req) {
  console.log("In the register API page");

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pass = searchParams.get("pass");
  const firstName = searchParams.get("firstName");
  const secondName = searchParams.get("secondName");
  const address = searchParams.get("address");
  const tel = searchParams.get("tel");

  if (!username || !validator.validate(username)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid email format.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!pass || pass.length < 6) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Password must be at least 6 characters long.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!/^\d+$/.test(tel)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid phone number format.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = process.env.DB_ADDRESS;
  if (!url) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Database address not configured.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("app");
    const collection = db.collection("users");

    const existingUser = await collection.findOne({ username: username });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Email already in use.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(pass, saltRounds);

    const newUser = {
      username,
      pass: hashedPass,
      firstName,
      secondName,
      address,
      tel,
    };
    const insertResult = await collection.insertOne(newUser);
    console.log("User inserted:", insertResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration successful.",
        redirect: "/login",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in register API:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
    console.log("Database connection closed.");
  }
}
