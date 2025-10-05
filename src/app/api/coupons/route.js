import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: Fetch all coupons or by ID
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const url = new URL(req.url);
    const id = url.searchParams.get("id"); // ?id=123

    let items;
    if (id) {
      items = await db.collection("coupons").findOne({ _id: new ObjectId(id) });
    } else {
      items = await db.collection("coupons").find().toArray();
    }

    return new Response(JSON.stringify(items), {
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

// 📌 POST: Add a new coupon (accept any structure, but couponCode is common)
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

    const result = await db.collection("coupons").insertOne(body);

    return new Response(JSON.stringify({ message: "Coupon added", data: result }), {
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

// 📌 PUT: Update coupon by ID
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

    const result = await db.collection("coupons").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "Coupon updated", result }), {
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

// 📌 DELETE: Remove coupon by ID
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

    const result = await db.collection("coupons").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Coupon deleted", result }), {
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
