# OAuth Setup Guide

## Google OAuth Configuration

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Google+ API (if not already enabled)
4. Go to "APIs & Services" → "Credentials"
5. Find your OAuth 2.0 Client ID

### 2. Current OAuth Client ID
```
567296917319-a1q9puqkpkkq65snf4uceni413pl4lkc.apps.googleusercontent.com
```

### 3. Required Redirect URIs

Add these **Authorized redirect URIs** in your Google OAuth client configuration:

**Development:**
- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3001/api/auth/callback/google`
- `http://localhost:3002/api/auth/callback/google`
- `http://localhost:3003/api/auth/callback/google`

**Production:**
- `https://next.zzzz.tech/api/auth/callback/google`
- `https://vercel-next-js-4b6b-mcuztglp7-simpowers-projects.vercel.app/api/auth/callback/google`

### 4. Required JavaScript Origins

Add these **Authorized JavaScript origins**:

**Development:**
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://localhost:3003`

**Production:**
- `https://next.zzzz.tech`
- `https://vercel-next-js-4b6b-mcuztglp7-simpowers-projects.vercel.app`

### 5. Environment Variables

Ensure these are set in Vercel:
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `NEXTAUTH_URL`: Your production domain (e.g., `https://next.zzzz.tech`)
- `NEXTAUTH_SECRET`: A secure random string

## Testing OAuth

After configuring the above:

1. Visit your production site: https://next.zzzz.tech
2. Click "Sign In" or try to create an item
3. Test Google OAuth login
4. Verify user creation in your database

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**
   - Check that all redirect URIs are correctly added to Google Cloud Console
   - Ensure URLs match exactly (http vs https, trailing slashes)

2. **"Origin mismatch" error**
   - Check that JavaScript origins are correctly configured
   - Ensure your domain is properly added

3. **OAuth not working**
   - Verify environment variables in Vercel
   - Check that Google+ API is enabled
   - Ensure OAuth consent screen is configured

### OAuth Consent Screen

Make sure your OAuth consent screen is configured:
1. Go to "APIs & Services" → "OAuth consent screen"
2. Fill in required information
3. Add test users if in development mode
4. Publish the app when ready for production

## Additional OAuth Providers

To add more OAuth providers (GitHub, Discord, etc.), update `lib/nextauth-config.ts`:

```typescript
import GitHubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID || "",
    clientSecret: process.env.GITHUB_SECRET || "",
  }),
  DiscordProvider({
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
  }),
],
```
