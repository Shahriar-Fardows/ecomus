import clientPromise from "@/lib/dbConnect"
import { ObjectId } from "mongodb"

// 📌 GET: Fetch all site info entries or by type
export async function GET(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // ?type=contact or ?type=about
    const id = searchParams.get('id') // ?id=ObjectId

    let query = {}
    
    // If specific ID requested
    if (id) {
      if (!ObjectId.isValid(id)) {
        return new Response(JSON.stringify({ 
          error: "Invalid ID format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query._id = new ObjectId(id)
    }
    
    // If specific type requested
    if (type) {
      const allowedTypes = ['contact', 'about']
      if (!allowedTypes.includes(type)) {
        return new Response(JSON.stringify({ 
          error: `Invalid type. Allowed types: ${allowedTypes.join(', ')}` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query.type = type
    }

    const siteInfo = await db.collection("siteInfo")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // If searching for specific ID and not found
    if (id && siteInfo.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Site info not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(siteInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching site info:", error)
    return new Response(JSON.stringify({ 
      error: "Failed to fetch site information",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 POST: Create new site info entry
export async function POST(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const body = await req.json()
    
    // Validation
    if (!body || Object.keys(body).length === 0) {
      return new Response(JSON.stringify({ 
        error: "No data provided" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!body.type) {
      return new Response(JSON.stringify({ 
        error: "Type is required (contact or about)" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const allowedTypes = ['contact', 'about']
    if (!allowedTypes.includes(body.type)) {
      return new Response(JSON.stringify({ 
        error: `Invalid type. Allowed types: ${allowedTypes.join(', ')}` 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!body.data) {
      return new Response(JSON.stringify({ 
        error: "Data object is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if entry with same type already exists
    const existingEntry = await db.collection("siteInfo").findOne({ type: body.type })
    
    if (existingEntry) {
      return new Response(JSON.stringify({ 
        error: `Entry with type '${body.type}' already exists. Use PUT to update.`,
        existingId: existingEntry._id
      }), {
        status: 409, // Conflict
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create new entry
    const newEntry = {
      type: body.type,
      data: body.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("siteInfo").insertOne(newEntry)
    const createdEntry = await db.collection("siteInfo").findOne({ 
      _id: result.insertedId 
    })

    return new Response(JSON.stringify(createdEntry), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error creating site info:", error)
    return new Response(JSON.stringify({ 
      error: "Failed to create site information",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 PUT: Update site info entry
export async function PUT(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")
    
    const updateData = await req.json()

    // Validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return new Response(JSON.stringify({ 
        error: "No update data provided" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let query = {}
    let updateMethod = "id" // Default to ID-based update

    // Check if updating by ID
    if (updateData.id) {
      if (!ObjectId.isValid(updateData.id)) {
        return new Response(JSON.stringify({ 
          error: "Invalid ID format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query._id = new ObjectId(updateData.id)
    }
    // Check if updating by type
    else if (updateData.type) {
      const allowedTypes = ['contact', 'about']
      if (!allowedTypes.includes(updateData.type)) {
        return new Response(JSON.stringify({ 
          error: `Invalid type. Allowed types: ${allowedTypes.join(', ')}` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query.type = updateData.type
      updateMethod = "type"
    }
    else {
      return new Response(JSON.stringify({ 
        error: "Either 'id' or 'type' is required for update" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if document exists
    const existingDoc = await db.collection("siteInfo").findOne(query)
    
    if (!existingDoc) {
      // If updating by type and doesn't exist, create new
      if (updateMethod === "type" && updateData.data) {
        const newEntry = {
          type: updateData.type,
          data: updateData.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const result = await db.collection("siteInfo").insertOne(newEntry)
        const createdEntry = await db.collection("siteInfo").findOne({ 
          _id: result.insertedId 
        })

        return new Response(JSON.stringify(createdEntry), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      }
      
      return new Response(JSON.stringify({ 
        error: "Site info not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Prepare update data
    const finalUpdateData = {
      updatedAt: new Date(),
    }

    // Add fields to update
    if (updateData.type && updateMethod === "id") {
      finalUpdateData.type = updateData.type
    }
    if (updateData.data) {
      finalUpdateData.data = updateData.data
    }

    // Remove fields that shouldn't be updated
    delete finalUpdateData.id
    delete finalUpdateData._id
    delete finalUpdateData.createdAt

    // Update the document
    const updateResult = await db.collection("siteInfo").updateOne(
      query, 
      { $set: finalUpdateData }
    )

    if (updateResult.modifiedCount === 0) {
      return new Response(JSON.stringify({ 
        message: "No changes were made",
        document: existingDoc
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
    
    // Return updated document
    const updatedDoc = await db.collection("siteInfo").findOne(query)

    return new Response(JSON.stringify(updatedDoc), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error updating site info:", error)
    return new Response(JSON.stringify({ 
      error: "Failed to update site information",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 DELETE: Delete site info entry
export async function DELETE(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")
    
    const body = await req.json()

    if (!body) {
      return new Response(JSON.stringify({ 
        error: "Request body is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let query = {}

    // Check if deleting by ID
    if (body.id) {
      if (!ObjectId.isValid(body.id)) {
        return new Response(JSON.stringify({ 
          error: "Invalid ID format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query._id = new ObjectId(body.id)
    }
    // Check if deleting by type
    else if (body.type) {
      const allowedTypes = ['contact', 'about']
      if (!allowedTypes.includes(body.type)) {
        return new Response(JSON.stringify({ 
          error: `Invalid type. Allowed types: ${allowedTypes.join(', ')}` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query.type = body.type
    }
    else {
      return new Response(JSON.stringify({ 
        error: "Either 'id' or 'type' is required for deletion" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if document exists before deleting
    const existingDoc = await db.collection("siteInfo").findOne(query)
    
    if (!existingDoc) {
      return new Response(JSON.stringify({ 
        error: "Site info not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Delete the document
    const deleteResult = await db.collection("siteInfo").deleteOne(query)

    return new Response(JSON.stringify({ 
      message: "Site info deleted successfully", 
      deletedCount: deleteResult.deletedCount,
      deletedDocument: {
        id: existingDoc._id,
        type: existingDoc.type
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error deleting site info:", error)
    return new Response(JSON.stringify({ 
      error: "Failed to delete site information",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// 📌 PATCH: Partial update site info entry
export async function PATCH(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")
    
    const patchData = await req.json()

    // Validation
    if (!patchData || Object.keys(patchData).length === 0) {
      return new Response(JSON.stringify({ 
        error: "No patch data provided" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    let query = {}

    // Check if patching by ID
    if (patchData.id) {
      if (!ObjectId.isValid(patchData.id)) {
        return new Response(JSON.stringify({ 
          error: "Invalid ID format" 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query._id = new ObjectId(patchData.id)
    }
    // Check if patching by type
    else if (patchData.type) {
      const allowedTypes = ['contact', 'about']
      if (!allowedTypes.includes(patchData.type)) {
        return new Response(JSON.stringify({ 
          error: `Invalid type. Allowed types: ${allowedTypes.join(', ')}` 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }
      query.type = patchData.type
    }
    else {
      return new Response(JSON.stringify({ 
        error: "Either 'id' or 'type' is required for patch" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if document exists
    const existingDoc = await db.collection("siteInfo").findOne(query)
    
    if (!existingDoc) {
      return new Response(JSON.stringify({ 
        error: "Site info not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // For partial updates to the data object
    let updateQuery = {
      updatedAt: new Date()
    }
    
    if (patchData.data) {
      // Merge with existing data
      updateQuery.data = {
        ...existingDoc.data,
        ...patchData.data
      }
    }
    
    if (patchData.type && patchData.id) {
      updateQuery.type = patchData.type
    }

    // Update the document
    await db.collection("siteInfo").updateOne(
      query, 
      { $set: updateQuery }
    )
    
    // Return updated document
    const updatedDoc = await db.collection("siteInfo").findOne(query)

    return new Response(JSON.stringify(updatedDoc), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error patching site info:", error)
    return new Response(JSON.stringify({ 
      error: "Failed to patch site information",
      details: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}