import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// GET: Fetch reviews with optional query parameters
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const sortBy = url.searchParams.get("sort") || "newest";
    const filterRating = url.searchParams.get("rating");

    const client = await clientPromise;
    const db = client.db("ecomus");

    // Build query - CRITICAL: productId must match exactly
    const query = {};
    if (productId) {
      query.productId = productId; // Keep as string to match your data
    }
    if (filterRating && filterRating !== "all") {
      query.rating = parseInt(filterRating);
    }

    // Build sort based on frontend options
    let sort = {};
    switch (sortBy) {
      case "newest":
        sort = { createdAt: -1 }; // newest first
        break;
      case "oldest":
        sort = { createdAt: 1 }; // oldest first
        break;
      case "highest":
        sort = { rating: -1, createdAt: -1 }; // highest rating first
        break;
      case "lowest":
        sort = { rating: 1, createdAt: -1 }; // lowest rating first
        break;
      default:
        sort = { createdAt: -1 };
    }

    const reviews = await db
      .collection("reviews")
      .find(query)
      .sort(sort)
      .toArray();

    return new Response(JSON.stringify(reviews), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch reviews", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// POST: Add a new review or comment
export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("ecomus");

    // Check if this is a comment on a review
    if (data.reviewId) {
      // This is a comment
      const comment = {
        userName: data.userName,
        userEmail: data.userEmail,
        text: data.text,
        createdAt: new Date(),
      };

      const result = await db.collection("reviews").updateOne(
        { _id: new ObjectId(data.reviewId) },
        { $push: { comments: comment } }
      );

      if (result.modifiedCount === 0) {
        return new Response(
          JSON.stringify({ message: "Review not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Comment added successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      // This is a new review
      const review = {
        productId: data.productId,
        userName: data.userName,
        userEmail: data.userEmail,
        text: data.text,
        rating: data.rating || 5,
        productImage: data.productImage || "",
        images: data.images || [],
        comments: [],
        verifiedPurchase: false, // You can add logic to verify purchases
        createdAt: new Date(),
      };

      const result = await db.collection("reviews").insertOne(review);

      return new Response(
        JSON.stringify({ message: "Review added successfully", id: result.insertedId }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error adding review/comment:", error);
    return new Response(
      JSON.stringify({ message: "Failed to add review/comment", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE: Delete a review by ID
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response(
        JSON.stringify({ message: "Review ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = await clientPromise;
    const db = client.db("ecomus");

    const result = await db.collection("reviews").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No review found with this ID" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Review deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting review:", error);
    return new Response(
      JSON.stringify({ message: "Failed to delete review", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}