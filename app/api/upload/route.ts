import { handleUpload } from '@vercel/blob/client';
import { NextRequest } from 'next/server';
import { safeContent, defaultSafeContentOptions } from '@/lib/safeContent';
import { corsEdge } from '@/lib/cors-edge';
import { verifyJWTEdge } from '@/lib/auth-edge';

export async function POST(request: NextRequest): Promise<Response> {
  const corsRes = corsEdge(request);
  if (corsRes) return corsRes;
  const authUser = verifyJWTEdge(request);
  if (authUser instanceof Response) return authUser;

  const body = (await request.json()) as any; // 兼容无类型导出
  // 对文件名和 tokenPayload 进行安全过滤（如有）
  if ('filename' in body && typeof body.filename === 'string' && body.filename) {
    body.filename = safeContent(body.filename, defaultSafeContentOptions);
  }
  if ('description' in body && typeof body.description === 'string' && body.description) {
    body.description = safeContent(body.description, defaultSafeContentOptions);
  }

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
          tokenPayload: clientPayload ? safeContent(clientPayload, defaultSafeContentOptions) : '',
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }: any) => {
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
    // 优化错误返回，包含 status 和 message
    return Response.json(
      { error: (error as Error).message || 'Unknown error', status: 400 },
      { status: 400 },
    );
  }
}
