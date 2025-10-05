import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: সব user entries বা নির্দিষ্ট ID অনুযায়ী
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // ?id=123

    let users;
    if (id) {
      users = await db.collection("userEntries").findOne({ _id: new ObjectId(id) });
    } else {
      users = await db.collection("userEntries").find().toArray();
    }

    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 📌 POST: নতুন user entry add করবে (যে কোনো data পাঠানো যাবে)
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    body.createdAt = new Date();

    const result = await db.collection("userEntries").insertOne(body);

    return new Response(JSON.stringify({ message: "User entry added", data: result }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 📌 PUT: user entry update করবে (ID লাগবে)
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id, ...updateData } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    updateData.updatedAt = new Date();

    const result = await db.collection("userEntries").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "User updated", result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// 📌 DELETE: user entry delete করবে (ID লাগবে)
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await db.collection("userEntries").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "User deleted", result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
