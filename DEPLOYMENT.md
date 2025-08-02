# Deployment Guide - Miss Bukola Lukan AI

This guide covers the complete deployment process for the Bukola AI application.

## 🔧 Prerequisites

### Required Services
1. **Supabase Account**: Database and backend services
2. **OpenAI Account**: API access for GPT-4
3. **Make.com Account**: Webhook automation (optional but recommended)
4. **Vercel Account**: Hosting platform (recommended)

### Environment Variables
Ensure you have all required environment variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# Optional but recommended
MAKE_WEBHOOK_URL=
ADMIN_SECRET=
NEXT_PUBLIC_APP_URL=
```

## 📊 Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize
4. Note down Project URL and API Keys

### 2. Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy contents from `database/schema.sql`
3. Execute the script
4. Verify tables are created:
   - `user_sessions`
   - `conversation_logs`
   - `document_store`

### 3. Configure Row Level Security
RLS is automatically enabled by the schema. Verify policies are in place for service role access.

### 4. Add Sample Data
The schema includes sample documents and users. You can add more company-specific documents via the admin API.

## 🤖 OpenAI Setup

### 1. Get API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys
3. Create new secret key
4. Set usage limits and billing

### 2. Model Configuration
The app uses `gpt-4-turbo-preview` by default. Ensure you have access to GPT-4 models.

## 🔗 Make.com Integration (Optional)

### 1. Create Webhook
1. Login to Make.com
2. Create new scenario
3. Add "Webhooks > Custom webhook" module
4. Copy webhook URL

### 2. Configure Automation
Set up your workflow to handle the task JSON structure:
```json
{
  "action": "string",
  "task": "string",
  "assignee": "string",
  "due": "string",
  "priority": "low|medium|high|urgent",
  "department": "string",
  "context": "string",
  "agent": "Bukola Lukan AI",
  "requested_by": "string",
  "source": "request_mode",
  "timestamp": "ISO8601"
}
```

## 🚀 Vercel Deployment

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import git repository
3. Vercel will auto-detect Next.js

### 2. Environment Variables
Add all environment variables in Vercel dashboard:
- Go to Project Settings
- Environment Variables tab
- Add each variable for Production, Preview, and Development

### 3. Deploy
1. Click Deploy
2. Wait for build to complete
3. Visit your live URL

### 4. Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

## 🏗 Alternative Deployment Options

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway deploy
```

### Netlify
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Docker (Self-hosted)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security Configuration

### 1. API Security
- Rotate API keys regularly
- Use environment variables only
- Never commit secrets to git

### 2. Database Security
- Enable RLS on all tables
- Regular backup schedule
- Monitor access logs

### 3. Application Security
- HTTPS only in production
- Secure headers configured
- Rate limiting on API routes

## 📈 Post-Deployment Setup

### 1. Test Core Functions
```bash
# Health check
curl https://your-app.vercel.app/api/chat

# Test webhook (if configured)
curl -X POST https://your-app.vercel.app/api/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"adminKey": "your-admin-secret"}'
```

### 2. Add Company Documents
Use the admin API to add your company's policies and procedures:

```bash
curl -X POST https://your-app.vercel.app/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "your-admin-secret",
    "title": "Company Policy XYZ",
    "content": "Policy content here...",
    "type": "policy",
    "department": "Operations",
    "author": "Bukola Lukan",
    "access_level": "public"
  }'
```

### 3. Configure Monitoring
Set up monitoring for:
- API response times
- Error rates
- Database performance
- Webhook delivery success

## 📊 Analytics Setup

### Built-in Analytics
Access analytics via admin API:
```bash
curl "https://your-app.vercel.app/api/admin/analytics?timeRange=7d&adminKey=your-admin-secret"
```

### External Analytics (Optional)
- **Vercel Analytics**: Automatic with Vercel Pro
- **Google Analytics**: Add tracking code to layout
- **PostHog**: For detailed user behavior

## 🔄 Updates and Maintenance

### 1. Regular Updates
- Monitor for security updates
- Update dependencies monthly
- Review and rotate API keys quarterly

### 2. Database Maintenance
- Regular backups (Supabase handles this)
- Monitor storage usage
- Archive old conversation logs if needed

### 3. Performance Monitoring
- Monitor API response times
- Track conversation success rates
- Monitor OpenAI API usage and costs

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
- Check environment variables are set
- Verify Node.js version compatibility
- Check for TypeScript errors

**Database Connection Issues**
- Verify Supabase URL and keys
- Check RLS policies
- Ensure database schema is up to date

**OpenAI API Errors**
- Check API key validity
- Verify model access (GPT-4)
- Monitor rate limits and billing

**Webhook Not Working**
- Test webhook URL manually
- Check Make.com scenario status
- Verify webhook service configuration

### Getting Help
1. Check application logs in Vercel dashboard
2. Review Supabase logs for database issues
3. Test individual API endpoints
4. Contact development team for complex issues

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Database schema deployed and tested
- [ ] Sample data added
- [ ] API endpoints tested
- [ ] Webhook integration tested (if used)
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation updated

---

**Deployment completed successfully! 🎉**

Your Miss Bukola Lukan AI is now live and ready to serve employees.