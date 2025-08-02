# Environment Setup Guide

The application needs environment variables to function properly. Create a `.env.local` file in your project root with the following variables:

## Required Environment Variables

### For Basic AI Functionality (Minimum Required)
```env
# OpenAI Configuration (REQUIRED for AI to work)
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### For Full Functionality with Database
```env
# Supabase Configuration (REQUIRED for full functionality)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Make.com Webhook (OPTIONAL - for Request Mode automation)
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/mcq5vr986m7uh1tv8dovl89pbsrxx3n9

# Bing Search API (OPTIONAL - for web search capabilities)
BING_SEARCH_API_KEY=your_bing_search_api_key

# Admin Access (OPTIONAL - for testing and analytics)
ADMIN_SECRET=your_secure_admin_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### Option 1: Quick Test (AI Only)
If you just want to test the AI conversation without database features:

1. Create `.env.local` file
2. Add only the OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your_openai_api_key_here
   ```
3. Run `npm run dev`
4. The AI will work with fallback documents (no conversation logging)

### Option 2: Full Setup (Recommended)
For complete functionality including conversation logging and analytics:

1. **Get OpenAI API Key**:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Create API key
   - Ensure you have access to GPT-4 models

2. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy Project URL and API keys
   - Run the database schema from `database/schema.sql`

3. **Create `.env.local`** with all variables above

4. **Optional - Make.com Webhook**:
   - Create Make.com account
   - Set up webhook scenario  
   - Use the provided webhook URL: `https://hook.eu2.make.com/mcq5vr986m7uh1tv8dovl89pbsrxx3n9`
   - **Status**: ✅ Active (responding with "Accepted")

5. **Optional - Bing Search API**:
   - Go to [Microsoft Azure Portal](https://portal.azure.com)
   - Create "Bing Search v7" resource
   - Copy API key for web search capabilities

## Verification

After setting up environment variables, you can verify configuration:

1. **Start the app**: `npm run dev`
2. **Check health**: Visit `http://localhost:3000/api/chat`
3. **Review logs**: Check console for configuration warnings

The health endpoint will show which services are configured:
```json
{
  "status": "healthy",
  "services": {
    "ai": true,
    "database": true,
    "webhook": false
  },
  "configuration": {
    "supabase_url": true,
    "supabase_anon_key": true,
    "supabase_service_key": true,
    "openai_key": true,
    "webhook_url": false,
    "web_search": true
  }
}
```

## Troubleshooting

### "supabaseUrl is required" Error
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Restart the development server after adding environment variables

### AI Not Responding
- Verify `OPENAI_API_KEY` is valid
- Check OpenAI account has credits
- Ensure you have access to GPT-4 models

### Database Operations Failing
- Confirm all three Supabase environment variables are set
- Verify database schema has been applied
- Check Supabase project is not paused

### Restart After Changes
Always restart the development server (`npm run dev`) after changing environment variables.