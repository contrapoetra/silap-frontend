import { NextRequest, NextResponse } from 'next/server';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, S3_BUCKET, S3_REGION } from '@/lib/s3';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    const prefix = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/`;
    if (!url.startsWith(prefix)) {
      return NextResponse.json({ error: 'Invalid S3 URL' }, { status: 400 });
    }

    const key = url.slice(prefix.length);

    await getS3Client().send(new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    }));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete from S3:', err);
    return NextResponse.json({ error: 'Failed to delete from S3' }, { status: 500 });
  }
}
