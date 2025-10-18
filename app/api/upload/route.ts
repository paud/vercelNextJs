import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        clientPayload?: string | null,
      ) => {
        // ✅ Beef up the security here by validating the user and pathname
        // before generating the token

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          addRandomSuffix: true,
          tokenPayload: clientPayload || '',
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // ✅ This will be called after the upload is completed
        // You can use this to update your database with the blob URL
        
        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Here you could save the blob URL to your database
          // For example, if you have a database connection:
          // await db.update({ imageUrl: blob.url, ... })
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
