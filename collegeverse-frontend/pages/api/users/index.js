const BACKEND_BASE =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

async function handleGet(req, res) {
  try {
    const target = new URL("/users", BACKEND_BASE);
    const { email } = req.query;

    if (email) {
      target.searchParams.set("email", String(email));
    }

    const response = await fetch(target, {
      headers: { Accept: "application/json" },
    });
    const body = await response.json();
    return res.status(response.status).json(body);
  } catch (error) {
    console.error("API /users GET failed", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function handlePost(req, res) {
  try {
    const response = await fetch(`${BACKEND_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });

    const body = await response.json();
    return res.status(response.status).json(body);
  } catch (error) {
    console.error("API /users POST failed", error);
    return res.status(500).json({ error: "Failed to add user" });
  }
}
