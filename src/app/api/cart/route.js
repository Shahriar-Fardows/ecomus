import clientPromise from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    const client = await clientPromise;
    const db = client.db("ecomus");

    const query = email ? { email } : {};
    const cartItems = await db.collection("cart").find(query).toArray();

    return new Response(JSON.stringify(cartItems), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Failed to fetch cart", 
        error: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.title || !data.price || !data.quantity) {
      return new Response(
        JSON.stringify({ 
          message: "Missing required fields: email, title, price, quantity" 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("ecomus");

    const result = await db.collection("cart").insertOne({
      ...data,
      createdAt: new Date()
    });

    return new Response(
      JSON.stringify({ 
        message: "Item added to cart", 
        id: result.insertedId 
      }), 
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Failed to add item", 
        error: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, quantity, selectedColor, selectedSize } = body;

    console.log("PUT /api/cart - Request body:", body);

    // Validate required fields
    if (!id) {
      console.log("PUT /api/cart - Missing id");
      return new Response(
        JSON.stringify({ 
          message: "id is required",
          received: body
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (quantity === undefined || quantity === null || quantity < 1) {
      console.log("PUT /api/cart - Invalid quantity:", quantity);
      return new Response(
        JSON.stringify({ 
          message: "quantity is required and must be greater than 0",
          received: { quantity }
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      console.log("PUT /api/cart - Invalid ObjectId:", id);
      return new Response(
        JSON.stringify({ 
          message: "Invalid id format",
          received: { id }
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const client = await clientPromise;
    const db = client.db("ecomus");

    // First, check if the item exists
    const existingItem = await db.collection("cart").findOne({ _id: new ObjectId(id) });
    console.log("PUT /api/cart - Existing item:", existingItem);

    if (!existingItem) {
      return new Response(
        JSON.stringify({ 
          message: "Item not found in cart",
          id: id
        }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Build update data
    const updateData = { 
      quantity: parseInt(quantity),
      updatedAt: new Date()
    };
    
    // Only update color/size if they are provided
    if (selectedColor !== undefined && selectedColor !== null) {
      updateData.selectedColor = selectedColor;
    }
    if (selectedSize !== undefined && selectedSize !== null) {
      updateData.selectedSize = selectedSize;
    }

    console.log("PUT /api/cart - Update data:", updateData);

    const result = await db.collection("cart").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    console.log("PUT /api/cart - Update result:", result);

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ 
          message: "No changes were made",
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Cart updated successfully", 
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("PUT /api/cart error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Failed to update item", 
        error: error.message,
        stack: error.stack
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id, email, clearAll } = await request.json();
    
    console.log("DELETE request data:", { id, email, clearAll });

    const client = await clientPromise;
    const db = client.db("ecomus");

    // Clear all items for a user
    if (clearAll && email) {
      const result = await db.collection("cart").deleteMany({ email });
      console.log("Clear all result:", result);
      
      return new Response(
        JSON.stringify({ 
          message: "All items deleted for this user",
          deletedCount: result.deletedCount
        }), 
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Delete single item
    if (!id) {
      return new Response(
        JSON.stringify({ 
          message: "id is required for single item deletion" 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ 
          message: "Invalid id format" 
        }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const result = await db.collection("cart").deleteOne({ _id: new ObjectId(id) });
    console.log("Delete single result:", result);

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Item not found" 
        }), 
        { 
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: "Item deleted successfully",
        deletedCount: result.deletedCount
      }), 
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return new Response(
      JSON.stringify({ 
        message: "Failed to delete item", 
        error: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}