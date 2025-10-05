import clientPromise from "@/lib/dbConnect"
import { ObjectId } from "mongodb"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
})

// GET banners (all or by ID)
export async function GET(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      // Fetch single banner by ID
      const banner = await db.collection("banners").findOne({ _id: new ObjectId(id) })
      if (!banner) return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 })
      return new Response(JSON.stringify(banner), { status: 200, headers: { "Content-Type": "application/json" } })
    } else {
      // Fetch all banners
      const banners = await db.collection("banners").find().toArray()
      return new Response(JSON.stringify(banners), { status: 200, headers: { "Content-Type": "application/json" } })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

// CREATE banner
export async function POST(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const {
      image,
      mobileImage,
      public_id,
      mobile_public_id,
      heading,
      headingStyle,
      description,
      descriptionStyle,
      buttons,
    } = await req.json()

    // Only check what’s absolutely required
    if (!image || !public_id) {
      return new Response(JSON.stringify({ error: "Image and public_id are required" }), { status: 400 })
    }

    const banner = {
      image,
      mobileImage: mobileImage || "",
      public_id,
      mobile_public_id: mobile_public_id || "",
      heading: heading ?? "", // accept empty string
      headingStyle: headingStyle || {},
      description: description ?? "",
      descriptionStyle: descriptionStyle || {},
      buttons: buttons || [],
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("banners").insertOne(banner)
    return new Response(
      JSON.stringify({ message: "Banner created", bannerId: result.insertedId }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

// UPDATE banner by ID
export async function PUT(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")

    const {
      id,
      image,
      mobileImage,
      public_id,
      mobile_public_id,
      heading,
      headingStyle,
      description,
      descriptionStyle,
      buttons,
    } = await req.json()
    if (!id) return new Response(JSON.stringify({ error: "Banner ID is required" }), { status: 400 })

    const updateFields = {}
    if (image !== undefined) updateFields.image = image
    if (mobileImage !== undefined) updateFields.mobileImage = mobileImage
    if (public_id !== undefined) updateFields.public_id = public_id
    if (mobile_public_id !== undefined) updateFields.mobile_public_id = mobile_public_id
    if (heading !== undefined) updateFields.heading = heading
    if (headingStyle !== undefined) updateFields.headingStyle = headingStyle
    if (description !== undefined) updateFields.description = description
    if (descriptionStyle !== undefined) updateFields.descriptionStyle = descriptionStyle
    if (buttons !== undefined) updateFields.buttons = buttons

    const result = await db.collection("banners").updateOne({ _id: new ObjectId(id) }, { $set: updateFields })
    return new Response(JSON.stringify({ message: "Banner updated", result }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}

// DELETE banner by ID + Cloudinary delete
export async function DELETE(req) {
  try {
    const client = await clientPromise
    const db = client.db("ecomus")
    const { id } = await req.json()
    if (!id) return new Response(JSON.stringify({ error: "Banner ID is required" }), { status: 400 })

    const banner = await db.collection("banners").findOne({ _id: new ObjectId(id) })
    if (!banner) return new Response(JSON.stringify({ error: "Banner not found" }), { status: 404 })

    if (banner.public_id) {
      await cloudinary.uploader.destroy(banner.public_id)
    }
    if (banner.mobile_public_id) {
      await cloudinary.uploader.destroy(banner.mobile_public_id)
    }

    // Delete from MongoDB
    const result = await db.collection("banners").deleteOne({ _id: new ObjectId(id) })

    return new Response(JSON.stringify({ message: "Banner deleted", result }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
