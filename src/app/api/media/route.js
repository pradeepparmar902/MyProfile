import { randomUUID } from "crypto";
import path from "path";
import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

function extensionFor(file) {
  const original = file.name || "upload";
  const ext = path.extname(original).toLowerCase();
  if (ext) return ext;
  if (file.type === "application/pdf") return ".pdf";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  return ".jpg";
}

async function uploadToFirebaseStorage(storagePath, bytes, contentType) {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) throw new Error("Firebase Storage bucket is not configured.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(storagePath)}`;
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
      body: bytes,
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || "Firebase Storage upload failed.");
    }

    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
  } finally {
    clearTimeout(timeout);
  }
}

async function canAttach(userId, relatedType, relatedId) {
  if (relatedType === "EDUCATION") {
    return Boolean(await db.education.findFirst({ where: { id: relatedId, userId } }));
  }
  if (relatedType === "ACHIEVEMENT") {
    return Boolean(await db.achievement.findFirst({ where: { id: relatedId, userId } }));
  }
  if (relatedType === "PROJECT") {
    return Boolean(await db.project.findFirst({ where: { id: relatedId, userId } }));
  }
  if (relatedType === "SKILL") {
    return Boolean(await db.skill.findFirst({ where: { id: relatedId, userId } }));
  }
  if (relatedType === "INTERNSHIP") {
    return Boolean(await db.internship.findFirst({ where: { id: relatedId, userId } }));
  }
  if (relatedType === "PROFESSION") {
    return Boolean(await db.profession.findFirst({ where: { id: relatedId, userId } }));
  }
  return false;
}

export async function GET(request) {
  const { user, response } = await authenticated();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const relatedType = searchParams.get("relatedType");
  const relatedId = searchParams.get("relatedId");

  if (!relatedType || !relatedId) {
    return error("Related type and ID are required.");
  }

  const media = await db.media.findMany({
    where: { userId: user.id, relatedType, relatedId },
    orderBy: { createdAt: "desc" },
  });

  return json({ media });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;

  const form = await request.formData();
  const relatedType = String(form.get("relatedType") || "").toUpperCase();
  const relatedId = String(form.get("relatedId") || "");
  const category = String(form.get("category") || "Other");
  const files = form.getAll("files").filter((file) => file && file.size > 0);

  if (!relatedType || !relatedId || !files.length) {
    return error("Choose at least one file to upload.");
  }

  if (!(await canAttach(user.id, relatedType, relatedId))) {
    return error("You cannot attach files to this record.", 403);
  }

  const created = [];
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return error("Only images and PDF files are supported.");
    }

    if (file.size > 8 * 1024 * 1024) {
      return error("Each file must be smaller than 8 MB.");
    }

    const id = randomUUID();
    const safeName = `${id}${extensionFor(file)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const storagePath = `uploads/${user.id}/${safeName}`;
    const fileUrl = await uploadToFirebaseStorage(storagePath, bytes, file.type);

    const media = await db.media.create({
      data: {
        userId: user.id,
        relatedType,
        relatedId,
        category,
        fileUrl,
        fileName: file.name || safeName,
        fileType: file.type.startsWith("image/") ? "IMAGE" : "PDF",
        mimeType: file.type,
      },
    });
    created.push(media);
  }

  return json({ media: created }, 201);
}
