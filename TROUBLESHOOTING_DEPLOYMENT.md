# Troubleshooting Deployment Issues - Miss Bukola AI

## 🚨 Client-Side Exception Error

If you're seeing "Application error: a client-side exception has occurred", here are the most common causes and solutions:

## 🔧 Environment Variables (Most Common Issue)

### Required Environment Variables
Make sure ALL these environment variables are set in your deployment platform:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://sraqayynnrewfhestvaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_service_role_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# OpenAI API Key (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Optional but recommended
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/izv2m5hp4p13jvnsin6j0gt5fhbyrdxr
ADMIN_SECRET=your_admin_secret_here
```

### How to Set Environment Variables

**Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development
4. Redeploy after adding variables

**Netlify:**
1. Site settings → Environment variables
2. Add each variable
3. Trigger a new deploy

**Railway:**
1. Project → Variables
2. Add each variable
3. Redeploy

## 🐛 Common Issues & Solutions

### 1. "OpenAI API key not configured"
**Cause:** `OPENAI_API_KEY` environment variable is missing or invalid
**Solution:** 
- Get a valid API key from [OpenAI Platform](https://platform.openai.com/api-keys)
- Add it to your environment variables
- Ensure the key has access to GPT-4 models

### 2. "Supabase not configured"
**Cause:** Supabase environment variables are missing
**Solution:**
- Get your Supabase URL and keys from your Supabase project dashboard
- Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
- Make sure your database schema is deployed (run `database/schema.sql`)

### 3. "Cannot read property of undefined"
**Cause:** Missing environment variables causing undefined values
**Solution:**
- Check browser console for specific error details
- Verify all environment variables are set correctly
- Ensure no typos in variable names

### 4. Build Errors
**Cause:** TypeScript errors or missing dependencies
**Solution:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules .next
npm install
npm run build
```

## 🔍 Debugging Steps

### 1. Check Browser Console
Open browser developer tools (F12) and look for:
- JavaScript errors
- Network request failures
- Missing environment variables

### 2. Test API Endpoints
Test your API endpoints directly:
```bash
# Test chat endpoint
curl -X POST https://your-app.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","userId":"test"}'

# Test health check
curl https://your-app.vercel.app/api/chat
```

### 3. Check Deployment Logs
- Vercel: Go to Functions tab in dashboard
- Netlify: Check deploy logs
- Railway: Check deployment logs

### 4. Verify Database Connection
Test if your Supabase connection works:
```bash
# Test with your actual Supabase URL
curl "https://your-project.supabase.co/rest/v1/conversation_logs?select=*&limit=1" \
  -H "apikey: your_anon_key" \
  -H "Authorization: Bearer your_service_role_key"
```

## 🛠 Quick Fixes

### If the app loads but chat doesn't work:
1. Check if `OPENAI_API_KEY` is set
2. Verify the key has sufficient credits
3. Check OpenAI API status

### If the app shows loading forever:
1. Check browser console for errors
2. Verify all environment variables are set
3. Check if Supabase is accessible

### If you get 500 errors:
1. Check deployment logs
2. Verify API routes are working
3. Test environment variables

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set
- [ ] Database schema is deployed
- [ ] OpenAI API key is valid and has credits
- [ ] Supabase project is active
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)

## 🚀 Testing Your Deployment

### 1. Basic Functionality Test
```bash
# Test the main page loads
curl -I https://your-app.vercel.app

# Test API endpoints
curl https://your-app.vercel.app/api/chat
```

### 2. Chat Functionality Test
1. Open your deployed app
2. Try sending a simple message like "Hello"
3. Check if you get a response
4. Check browser console for any errors

### 3. Environment Variable Test
Add this temporary endpoint to test environment variables:

```typescript
// src/app/api/test-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasWebhook: !!process.env.MAKE_WEBHOOK_URL,
  });
}
```

Then test: `curl https://your-app.vercel.app/api/test-env`

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the exact error message** in browser console
2. **Verify environment variables** are set correctly
3. **Test API endpoints** individually
4. **Check deployment logs** for server-side errors
5. **Try a fresh deployment** with all variables set

### Common Error Messages:

- `"OpenAI API key not configured"` → Set `OPENAI_API_KEY`
- `"Supabase not configured"` → Set Supabase environment variables
- `"Cannot read property of undefined"` → Check all environment variables
- `"Network Error"` → Check API endpoint URLs
- `"500 Internal Server Error"` → Check server logs

## 📞 Getting Help

If you need additional help:
1. Check the deployment logs in your hosting platform
2. Test individual API endpoints
3. Verify all environment variables are set correctly
4. Ensure your database schema is deployed

The most common cause of the "client-side exception" error is missing environment variables, especially the OpenAI API key and Supabase configuration. 