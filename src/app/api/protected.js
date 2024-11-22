import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  const session = await getCustomSession(); // Retrieve session

  if (session && session.role === "customer") {
    console.log("Session data retrieved:", session);

    return new Response(JSON.stringify({ success: true, email: session.email }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    console.log("Unauthorized access or no session data.");
    return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
