import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// 📌 GET: Fetch orders (by ID, userEmail, or any query params)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const url = new URL(req.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());

    let query = {};

    // If ID exists, prioritize finding by ID
    if (searchParams.id) {
      query._id = new ObjectId(searchParams.id);
      const order = await db.collection("orders").findOne(query);
      return new Response(JSON.stringify(order), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Otherwise use all other query params as filters
    Object.keys(searchParams).forEach((key) => {
      if (key !== "id") {
        query[key] = searchParams[key];
      }
    });

    const orders = await db.collection("orders").find(query).toArray();

    return new Response(JSON.stringify(orders), {
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

// 📌 POST: Create new order
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const body = await req.json();
    if (!body || Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ error: "No order data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    body.createdAt = new Date();

    const result = await db.collection("orders").insertOne(body);

    return new Response(JSON.stringify({ message: "Order placed", data: result }), {
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

// 📌 PUT: Update order by ID
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id, ...updateData } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Order ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return new Response(JSON.stringify({ message: "Order updated", result }), {
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

// 📌 DELETE: Remove order by ID
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { id } = await req.json();
    if (!id) {
      return new Response(JSON.stringify({ error: "Order ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) });

    return new Response(JSON.stringify({ message: "Order deleted", result }), {
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
