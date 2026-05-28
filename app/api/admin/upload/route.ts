import { NextRequest, NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';

// POST /api/admin/upload — upload an image to Azure Blob Storage
// Body: multipart/form-data with a "file" field
// Returns: { url: string }
export async function POST(req: NextRequest) {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return NextResponse.json({ error: 'Azure Storage not configured.' }, { status: 500 });
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

  // Validate size (max 500 KB)
  if (file.size > 500 * 1024) {
    return NextResponse.json({ error: 'File must be under 500 KB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const blobName = `${randomUUID()}.${ext}`;

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient('announcements');

  // Ensure container exists with public blob access
  await containerClient.createIfNotExists({ access: 'blob' });

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: file.type },
  });

  return NextResponse.json({ url: blockBlobClient.url }, { status: 201 });
}
