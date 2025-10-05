import clientPromise from "@/lib/dbConnect"
import { ObjectId } from "mongodb"

// 📌 GET all categories with populated product details
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const categories = await db.collection("categories").find().toArray()

    // Populate product details for each category
    for (const category of categories) {
      if (category.productIds && category.productIds.length > 0) {
        const productObjectIds = category.productIds.map((id) => new ObjectId(id))
        const products = await db
          .collection("products")
          .find({ _id: { $in: productObjectIds } })
          .toArray()
        category.products = products
      } else {
        category.products = []
      }
    }

    return new Response(JSON.stringify(categories), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 POST: Add a new category with product validation
export async function POST(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const body = await req.json()
    if (!body || Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ error: "No data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate and filter existing product IDs
    let validProductIds = []
    if (body.products && Array.isArray(body.products)) {
      const productObjectIds = body.products.map((id) => new ObjectId(id))
      const existingProducts = await db
        .collection("products")
        .find({ _id: { $in: productObjectIds } })
        .toArray()

      validProductIds = existingProducts.map((product) => product._id.toString())

      // Remove duplicates
      validProductIds = [...new Set(validProductIds)]
    }

    const categoryData = {
      ...body,
      productIds: validProductIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Remove the products field as we store productIds
    delete categoryData.products

    const result = await db.collection("categories").insertOne(categoryData)

    // Return the created category with populated products
    const createdCategory = await db.collection("categories").findOne({ _id: result.insertedId })
    if (createdCategory.productIds && createdCategory.productIds.length > 0) {
      const productObjectIds = createdCategory.productIds.map((id) => new ObjectId(id))
      const products = await db
        .collection("products")
        .find({ _id: { $in: productObjectIds } })
        .toArray()
      createdCategory.products = products
    } else {
      createdCategory.products = []
    }

    return new Response(JSON.stringify(createdCategory), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 PUT: Update a category by ID with proper product replacement
export async function PUT(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const { id, ...updateData } = await req.json()
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get existing category
    const existingCategory = await db.collection("categories").findOne({ _id: new ObjectId(id) })
    if (!existingCategory) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    let validProductIds = []
    if (updateData.products && Array.isArray(updateData.products)) {
      const productObjectIds = updateData.products.map((id) => new ObjectId(id))
      const existingProducts = await db
        .collection("products")
        .find({ _id: { $in: productObjectIds } })
        .toArray()

      validProductIds = existingProducts.map((product) => product._id.toString())
      // Remove duplicates
      validProductIds = [...new Set(validProductIds)]
    }

    const finalUpdateData = {
      ...updateData,
      productIds: validProductIds, // Use only the new product IDs, don't merge
      updatedAt: new Date(),
    }

    // Remove the products field as we store productIds
    delete finalUpdateData.products

    const result = await db.collection("categories").updateOne({ _id: new ObjectId(id) }, { $set: finalUpdateData })

    // Return updated category with populated products
    const updatedCategory = await db.collection("categories").findOne({ _id: new ObjectId(id) })
    if (updatedCategory.productIds && updatedCategory.productIds.length > 0) {
      const productObjectIds = updatedCategory.productIds.map((id) => new ObjectId(id))
      const products = await db
        .collection("products")
        .find({ _id: { $in: productObjectIds } })
        .toArray()
      updatedCategory.products = products
    } else {
      updatedCategory.products = []
    }

    return new Response(JSON.stringify(updatedCategory), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 DELETE: Delete a category by ID
export async function DELETE(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const { id } = await req.json()
    if (!id) {
      return new Response(JSON.stringify({ error: "ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await db.collection("categories").deleteOne({ _id: new ObjectId(id) })

    return new Response(JSON.stringify({ message: "Category deleted", result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
