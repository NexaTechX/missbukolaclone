# Quick Start Guide - Miss Bukola Lukan AI

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Setup
Create `.env.local` file with your actual credentials:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI Configuration (Required)
OPENAI_API_KEY=sk-your_openai_api_key_here

# Make.com Webhook (Optional - for Request Mode)
MAKE_WEBHOOK_URL=https://hook.make.com/your_webhook_url

# Admin Access (Optional - for testing)
ADMIN_SECRET=your_secure_admin_password

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Database Setup

#### Option A: Using Supabase Dashboard
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Click Run to create all tables and sample data

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link to your project
supabase login
supabase link --project-ref your-project-ref

# Apply schema
supabase db push
```

### Step 4: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with Miss Bukola!

---

## 🧪 Testing the AI

### Sample Conversations to Try

**Normal Mode:**
- "What are Gtext Holdings' core values?"
- "Tell me about our investment platform Gvest"
- "How should I handle a delayed project?"

**Request Mode (Toggle ON):**
- "Please assign John to review the Q3 reports by Friday"
- "Schedule a team meeting for next Tuesday at 2 PM"
- "Approve the budget increase for the Dubai project"

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**⚠️ "AI response not working"**
- Check OpenAI API key is valid and has credits
- Verify environment variables are loaded (restart dev server)

**⚠️ "Database connection failed"**
- Confirm Supabase URL and keys are correct
- Check if database schema has been applied
- Verify network connectivity to Supabase

**⚠️ "Request Mode not sending webhooks"**
- Ensure MAKE_WEBHOOK_URL is configured
- Test webhook endpoint manually
- Check Make.com scenario is active

**⚠️ "Build errors"**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version is 18+ 
- Clear `.next` folder and restart

### Quick Health Check
Visit `http://localhost:3000/api/chat` to see system status

---

## 🎯 Next Steps

### Production Deployment
1. **Environment**: Set all production environment variables
2. **Database**: Run schema on production Supabase instance  
3. **Deploy**: Use Vercel, Railway, or your preferred platform
4. **Monitor**: Set up logging and analytics

### Customization
1. **Documents**: Add your company documents via admin API
2. **Styling**: Modify `src/styles/globals.css` for branding
3. **Features**: Extend functionality in `src/lib/ai-service.ts`

### Support
- Check `README.md` for detailed documentation
- Review `DEPLOYMENT.md` for production setup
- Open GitHub issues for bug reports

---

**You're ready to experience Miss Bukola Lukan's authentic AI clone! 🎉**