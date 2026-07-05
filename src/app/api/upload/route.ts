import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, S3_BUCKET, S3_REGION } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType, folder } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Missing fileName or fileType' }, { status: 400 });
    }

    const prefix = folder === 'berkas' ? 'berkas' : 'gallery';
    const key = `${prefix}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
    const publicUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error('Failed to generate upload URL:', err);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
