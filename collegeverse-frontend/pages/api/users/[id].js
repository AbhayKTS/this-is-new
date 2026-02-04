const BACKEND_BASE =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    return handlePut(req, res);
  }

  res.setHeader("Allow", ["PUT"]);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}

async function handlePut(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing user id" });
    }

    const response = await fetch(`${BACKEND_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });

    const body = await response.json();
    return res.status(response.status).json(body);
  } catch (error) {
    console.error("API /users/[id] PUT failed", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
}
