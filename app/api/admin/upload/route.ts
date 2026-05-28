import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const BANNER_W = 1200;
const BANNER_H = 250;

// POST /api/admin/upload — upload an image to Azure Blob Storage
// Resizes to 1200×250 before storing so banners are always pixel-perfect.
// Body: multipart/form-data with a "file" field
// Returns: { url: string }
export async function POST(req: NextRequest) {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!connectionString) {
      return NextResponse.json({ error: 'Azure Storage not configured. Set AZURE_STORAGE_CONNECTION_STRING in App Service environment variables.' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate type
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, GIF, and WebP images are allowed.' }, { status: 400 });
    }

    // Validate original size (max 10 MB before resize)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10 MB.' }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Resize to exact banner dimensions — cover crop, centre-anchored
    // GIFs are flattened to a static frame (sharp doesn't animate)
    const resizedBuffer = await sharp(rawBuffer)
      .resize(BANNER_W, BANNER_H, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer();

    const blobName = `${randomUUID()}.png`;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient('announcements');

    // Ensure container exists (public access configured at the storage account level)
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(resizedBuffer, {
      blobHTTPHeaders: { blobContentType: 'image/png' },
    });

    return NextResponse.json({ url: blockBlobClient.url }, { status: 201 });
  } catch (err: unknown) {
    console.error('[upload] Error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
