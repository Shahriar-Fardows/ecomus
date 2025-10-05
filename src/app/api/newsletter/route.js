import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: সব newsletter signups বা নির্দিষ্ট ID দিয়ে খুঁজবে
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // ?id=123

    let subscribers;
    if (id) {
      subscribers = await db.collection("newsletter").findOne({ _id: new ObjectId(id) });
    } else {
      subscribers = await db.collection("newsletter").find().toArray();
    }

    return new Response(JSON.stringify(subscribers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 POST: নতুন subscriber add করবে
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

    // Optional: Duplicate email check
    if (body.email) {
      const exists = await db.collection("newsletter").findOne({ email: body.email });
      if (exists) {
        return new Response(JSON.stringify({ message: "Email already subscribed" }), {
          status: 400,
        });
      }
    }

    const result = await db.collection("newsletter").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: "Subscribed successfully", data: result }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 PUT: Update subscriber by ID
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

    const result = await db.collection("newsletter").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "Subscriber updated", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 DELETE: Remove subscriber by ID
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

    const result = await db.collection("newsletter").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Subscriber removed", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
