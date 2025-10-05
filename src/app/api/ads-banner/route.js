import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: সব banner বা নির্দিষ্ট ID দিয়ে খুঁজবে
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // ?id=123

    let banners;
    if (id) {
      banners = await db.collection("adsBanner").findOne({ _id: new ObjectId(id) });
    } else {
      banners = await db.collection("adsBanner").find().toArray();
    }

    return new Response(JSON.stringify(banners), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 POST: Add a new banner (any data)
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

    const result = await db.collection("adsBanner").insertOne(body);

    return new Response(JSON.stringify({ message: "Banner added", result }), {
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 PUT: Update banner by ID
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

    const result = await db.collection("adsBanner").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "Banner updated", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

// 📌 DELETE: Delete banner by ID
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

    const result = await db.collection("adsBanner").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Banner deleted", result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
