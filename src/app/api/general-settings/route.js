import clientPromise from "@/lib/dbConnect";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});


// 📌 Get settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const settings = await db.collection("general_settings").findOne({});
    return new Response(JSON.stringify(settings || {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// 📌 Create / Update settings
export async function POST(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { logo, socials, announcements, announcementsStatus } = await req.json();

    // Check old settings
    const oldSettings = await db.collection("general_settings").findOne({});

    // Delete old logo from Cloudinary if new one provided
    if (oldSettings?.logo?.public_id && logo?.public_id && oldSettings.logo.public_id !== logo.public_id) {
      await cloudinary.uploader.destroy(oldSettings.logo.public_id);
    }

    const result = await db.collection("general_settings").updateOne(
      {},
      {
        $set: {
          logo, // { url, public_id, width }
          socials,
          announcements,
          announcementsStatus,
        },
      },
      { upsert: true }
    );

    return new Response(JSON.stringify({ message: "Settings saved", result }), { status: 200 });
  } catch (error) {
    console.error("POST error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// 📌 Update only announcementsStatus
export async function PUT(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { announcementsStatus } = await req.json();

    const result = await db.collection("general_settings").updateOne({}, { $set: { announcementsStatus } });

    return new Response(JSON.stringify({ message: "Announcements status updated", result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// 📌 Delete announcement by index
export async function DELETE(req) {
  try {
    const client = await clientPromise;
    const db = client.db("ecomus");

    const { index } = await req.json();

    const settings = await db.collection("general_settings").findOne({});
    if (!settings || !settings.announcements) {
      return new Response(JSON.stringify({ error: "No announcements found" }), { status: 404 });
    }

    const updated = settings.announcements.filter((_, i) => i !== index);

    const result = await db.collection("general_settings").updateOne(
      {},
      { $set: { announcements: updated } }
    );

    return new Response(JSON.stringify({ message: "Announcement deleted", result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
