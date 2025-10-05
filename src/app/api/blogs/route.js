import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: All blogs or single blog by ID
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let blogs;
    if (id) {
      blogs = await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    } else {
      blogs = await db.collection("blogs").find().toArray();
    }

    return new Response(JSON.stringify(blogs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 POST: Add a new blog
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
      });
    }

    const result = await db.collection("blogs").insertOne(body);

    return new Response(JSON.stringify({ message: "Blog added", result }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 PUT: Update blog by ID
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id, ...updateData } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
      });
    }

    const result = await db.collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "Blog updated", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 DELETE: Delete blog by ID
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
      });
    }

    const result = await db.collection("blogs").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Blog deleted", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
