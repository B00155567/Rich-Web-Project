import { getCustomSession } from "../sessionCode.js";

export async function GET(req) {
  const session = await getCustomSession();

  console.log("Retrieved session:", session);

  if (session && session.email) {
    return new Response(JSON.stringify({ email: session.email, role: session.role }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ error: "No session found" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
