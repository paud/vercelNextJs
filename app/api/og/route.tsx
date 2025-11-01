import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getOGTranslation } from '@/lib/og-translations';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取语言参数
    const locale = searchParams.get('locale') || 'zh';
    const t = getOGTranslation(locale);
    
    // 可以通过查询参数自定义
    const title = searchParams.get('title') || t.siteName;
    const description = searchParams.get('description') || t.defaultDescription;
    const price = searchParams.get('price') || '';
    let imageUrl = searchParams.get('image') || '';
    const category = searchParams.get('category') || '';
    const condition = searchParams.get('condition') || '';
    const location = searchParams.get('location') || '';
    
    // 处理图片URL - 清理查询参数并确保是完整URL
    if (imageUrl) {
      // 移除查询参数
      imageUrl = imageUrl.split('?')[0];
      
      // 如果是相对路径，转换为绝对路径
      if (imageUrl.startsWith('/')) {
        const baseUrl = request.url.split('/api/')[0];
        imageUrl = `${baseUrl}${imageUrl}`;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#ffffff',
            padding: 0,
          }}
        >
          {/* 左侧：商品图片或背景 */}
          <div
            style={{
              width: '40%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f9ff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {imageUrl ? (
              // 使用img标签显示商品图片（更可靠）
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              // 没有图片时显示渐变背景和图标
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                <div
                  style={{
                    fontSize: 120,
                    opacity: 0.8,
                  }}
                >
                  🛍️
                </div>
              </div>
            )}
          </div>

          {/* 右侧：商品信息 */}
          <div
            style={{
              width: '60%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px',
              backgroundColor: '#ffffff',
            }}
          >
            {/* 品牌Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 30,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  backgroundColor: '#06C755',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  marginRight: 15,
                }}
              >
                🏪
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                }}
              >
                {t.siteName}
              </div>
            </div>

            {/* 商品标题 */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: '#1a1a1a',
                marginBottom: 20,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {title}
            </div>

            {/* 价格 */}
            {price && (
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: '#06C755',
                  marginBottom: 20,
                }}
              >
                {t.currency}{price}
              </div>
            )}

            {/* 描述 */}
            {description && description !== t.defaultDescription && (
              <div
                style={{
                  fontSize: 24,
                  color: '#666666',
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {description}
              </div>
            )}

            {/* 底部标签 */}
            <div
              style={{
                display: 'flex',
                marginTop: 30,
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              {category && (
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: 8,
                    fontSize: 20,
                    color: '#0284c7',
                  }}
                >
                  {category}
                </div>
              )}
              {condition && (
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: 8,
                    fontSize: 20,
                    color: '#16a34a',
                  }}
                >
                  {condition}
                </div>
              )}
              {location && (
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: 8,
                    fontSize: 20,
                    color: '#ca8a04',
                  }}
                >
                  📍 {location}
                </div>
              )}
              {!category && !condition && !location && (
                <>
                  <div
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f0f9ff',
                      borderRadius: 8,
                      fontSize: 20,
                      color: '#0284c7',
                    }}
                  >
                    {t.defaultTag1}
                  </div>
                  <div
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#f0fdf4',
                      borderRadius: 8,
                      fontSize: 20,
                      color: '#16a34a',
                    }}
                  >
                    {t.defaultTag2}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error('OG Image generation error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
