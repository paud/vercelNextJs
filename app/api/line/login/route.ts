import { NextRequest, NextResponse } from 'next/server';

function base64url(input: ArrayBuffer | Uint8Array) {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  let str = Buffer.from(bytes).toString('base64');
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(verifier: string) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64url(digest);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const clientId = process.env.LINE_CLIENT_ID!;
  const baseUrl = process.env.NEXTAUTH_URL || `${url.protocol}//${url.host}`;
  const fallbackCallback = `${baseUrl}/api/line/callback`;
  const callbackUrl = process.env.LINE_REDIRECT_URI || fallbackCallback;

  // state 可包含回调地址与本地化等
  const statePayload = {
    t: Date.now(),
    cb: url.searchParams.get('callback') || `${baseUrl}/en/users/profile`,
  };
  const state = base64url(Buffer.from(JSON.stringify(statePayload)));

  // PKCE
  const codeVerifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const codeChallenge = await sha256(codeVerifier);

  // OIDC nonce
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(16)));

  const includeEmail = process.env.LINE_ENABLE_EMAIL_SCOPE === 'true';
  const scope = includeEmail ? 'openid profile email' : 'openid profile';

  const authorizeUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(callbackUrl)}&state=${encodeURIComponent(
    state
  )}&scope=${encodeURIComponent(scope)}&code_challenge=${encodeURIComponent(
    codeChallenge
  )}&code_challenge_method=S256&nonce=${encodeURIComponent(nonce)}&prompt=consent`;

  const res = NextResponse.redirect(authorizeUrl);

  const isProd = process.env.NODE_ENV === 'production';
  res.cookies.set('line_state', state, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 900 });
  res.cookies.set('line_code_verifier', codeVerifier, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 900 });
  res.cookies.set('line_nonce', nonce, { httpOnly: true, secure: isProd, sameSite: 'lax', path: '/', maxAge: 900 });
  return res;
}
