# Miss Bukola Lukan AI - Authentic Digital Clone

A sophisticated AI web application that serves as the **authentic digital clone** of **Miss Bukola Lukan**, the Group Chief Operations Officer (GCOO) of Gtext Holdings - a multinational real estate conglomerate operating across Nigeria, Dubai, Doha, and Brookshire, USA. This application enables employees to interact with her AI agent embodying her exact leadership philosophy, communication style, and operational excellence.

## 🎯 Purpose & Mission

- **Executive Continuity**: Maintain Miss Bukola's leadership guidance when she's unavailable
- **Operational Excellence**: Provide instant access to Gtext Holdings policies, procedures, and vision
- **Task Automation**: Convert requests into actionable tasks via Make.com integration
- **Leadership Development**: Model her philosophy of "Lead right, and the people will follow"
- **Global Coordination**: Support operations across all Gtext Holdings subsidiaries worldwide

## 🧠 Authentic AI Persona

### Miss Bukola's Leadership Philosophy
**Core Mantra**: *"Bukola, lead right, and the people will follow."*

**Leadership Beliefs**:
- A confident woman radiates quiet strength—not through volume, but through clarity, emotional intelligence, and decisiveness
- Loyalty must be modeled from the top before it can be expected from others
- Leadership is not about aggression; it's about assertiveness
- We are privileged shepherds, entrusted with guiding people toward purpose

### Personality Traits (Embedded in AI)
- **Selflessness** – Puts mission and team first
- **Positivity** – Encouraging, calm, never reactive  
- **Innovation & Creativity** – Future-focused, embraces change
- **Integrity** – Transparent, ethical, and honest
- **Excellence** – Never compromises on quality
- **Loyalty** – Deeply committed to team, vision, and Chairman

### Gtext Holdings Core Values
- Energy
- Excellence
- Integrity
- Innovation
- Punctuality
- Proactiveness
- Good Leadership

## 🏢 Gtext Holdings Subsidiaries (AI Knowledge Base)

The AI has comprehensive knowledge of all Gtext Holdings subsidiaries:

### 🎓 **Stephen Akintayo Foundation**
- **Purpose**: Educational empowerment and investment coaching
- **Leader**: Dr. Stephen Akintayo (Chairman)
- **Focus**: Sharing insights in real estate, business, and investment

### 🤝 **Gtext and Associates**
- **Mission**: Raise 100,000+ billionaires yearly through real estate
- **Network**: External agents and their businesses
- **Focus**: Agent training and wealth creation opportunities

### 🏨 **Gtext Suites**
- **Locations**: Dubai and Doha properties
- **Benefits**: Golden visa programs, high ROI, zero VAT/property tax
- **CEO**: Bisi Akintayo

### 🏞️ **Gtext Land**
- **Goal**: 25,000 luxury serviced plots by 2035 across 200 estates
- **Entry**: From ₦5M with 3-6 month payment plans
- **Locations**: Lagos, Oyo, Abeokuta, Abuja, Port Harcourt
- **CEO**: Martha Onsachi

### 🏡 **Gtext Homes**
- **Vision**: World's largest smart/green home developer
- **Products**: 4 & 5-bedroom luxury duplexes
- **Global**: Nigeria, UK, USA, Dubai operations
- **CEO**: Farouq Usman

### 🌾 **Gtext Farms**
- **Focus**: Agribusiness, food security, wealth creation
- **Mission**: Transform Africa's agricultural landscape

### 📱 **Gtext Media**
- **Vision**: Raise content creators to increase brand visibility
- **Goal**: Drive property sales through unique content creation
- **MD**: Farouq Usman

### 💰 **Gvest**
- **Mission**: Democratize real estate investment
- **Target**: 200,000 investors by 2027
- **Returns**: 14-26% annually (Naira), 7-20% (USD)
- **Platform**: Fractional real estate investment
- **President**: Bukola Lukan

## 🔧 Key Features

### 🧠 **Advanced AI Capabilities**
- **Authentic Persona**: Responds exactly like Miss Bukola with her leadership style
- **RAG System**: Knowledge base from Gtext Holdings documents
- **Web Search Integration**: Searches online for current Gtext Holdings information
- **Smart Fallback**: Automatically searches web when knowledge base is insufficient
- **Executive Decision Making**: Provides authoritative guidance with clear next steps

### 🔄 **Request Mode System**
- **Task Generation**: Converts employee messages into structured JSON tasks
- **Make.com Integration**: Automatically sends tasks to workflow automation
- **Comprehensive Logging**: All interactions stored in Supabase for audit trails
- **Webhook Reliability**: Retry mechanisms and error handling for critical operations

### 🌐 **Web Search Intelligence**
- **Dynamic Information**: Finds current Gtext Holdings information online
- **Context-Aware Search**: Focuses on Gtext Holdings, Stephen Akintayo, and Miss Bukola content
- **Source Attribution**: Clearly marks online information vs. company documents
- **Miss Bukola's Tone**: Processes web results and responds in her authentic style

### 🏗️ **Technical Architecture**
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Supabase**: Database, authentication, and real-time capabilities
- **OpenAI GPT-4**: Advanced language model for executive responses
- **Bing Search API**: Web search for current information
- **Tailwind CSS**: Professional, responsive UI design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Make.com webhook URL (for Request Mode)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd bukola-ai-clone
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Make.com Webhook (Optional - for Request Mode)
   MAKE_WEBHOOK_URL=your_make_com_webhook_url

   # Bing Search API (Optional - for web search)
   BING_SEARCH_API_KEY=your_bing_search_api_key

   # Admin Secret (for testing/analytics)
   ADMIN_SECRET=your_secure_admin_password
   ```

3. **Database Setup**
   ```bash
   # Run the schema in your Supabase SQL editor
   # Copy contents from database/schema.sql
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Core Tables
- **`user_sessions`**: Employee session tracking
- **`conversation_logs`**: Complete interaction history
- **`document_store`**: Company documents for RAG system

### Key Features
- Full-text search on documents
- Automatic interaction counting
- RLS (Row Level Security) enabled
- Analytics functions built-in

## 🔧 API Endpoints

### Chat API
```
POST /api/chat
```
Main conversation endpoint with request mode support.

### Webhook Testing
```
POST /api/webhook/test
```
Test Make.com webhook connectivity (admin only).

### Analytics
```
GET /api/admin/analytics?timeRange=7d&adminKey=xxx
```
Fetch usage analytics and metrics.

### Document Management
```
GET /api/documents?type=policy&department=Operations
POST /api/documents (admin only)
```

## 💼 Request Mode Usage

When **Request Mode** is enabled, every user message is interpreted as a task:

**Example Input:**
```
"Please assign Mr. John to handle the onboarding session next Tuesday."
```

**Generated JSON:**
```json
{
  "action": "assign",
  "task": "handle the onboarding session",
  "assignee": "Mr. John",
  "due": "next Tuesday",
  "priority": "medium",
  "agent": "Bukola Lukan AI",
  "requested_by": "emp_123",
  "source": "request_mode",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

This JSON is automatically sent to your Make.com webhook for processing.

## 🔍 Web Search Intelligence

Miss Bukola AI can search for current Gtext Holdings information online when needed:

**Example Queries:**
- "What are the latest updates from Gtext Holdings?"
- "Current property prices in our Dubai projects"
- "Stephen Akintayo's recent media appearances"
- "Latest Gvest investment rates and announcements"

The AI automatically detects when web search is needed and seamlessly combines online information with company documents, always responding in Miss Bukola's authentic executive style.

**See [WEB_SEARCH_FEATURE.md](./WEB_SEARCH_FEATURE.md) for detailed documentation.**

## 🎨 UI Components

### Executive Design System
- **Color Scheme**: Professional blues and grays with executive gradients
- **Typography**: Clear hierarchy with executive-appropriate fonts
- **Layout**: Clean, focused interface optimizing for productivity
- **Responsive**: Works seamlessly on desktop, tablet, and mobile

### Key Components
- **ChatInterface**: Main conversation UI with real-time messaging
- **UserSetup**: Employee onboarding and identification
- **TaskDisplay**: Rich task visualization with priority indicators
- **SourceIndicators**: RAG context and confidence scoring

## 🔒 Security & Privacy

### Data Protection
- All user sessions and conversations encrypted
- Sensitive API keys stored securely in environment variables
- Row Level Security on all database tables
- Admin endpoints protected with secret authentication

### Compliance Features
- Complete audit trail of all interactions
- User session tracking for accountability
- Conversation logging with metadata
- Webhook delivery confirmation

## 📈 Analytics & Monitoring

### Built-in Metrics
- **Conversation Volume**: Track usage patterns by department/time
- **Request Mode Usage**: Monitor task generation frequency
- **Confidence Scoring**: RAG system performance metrics
- **Webhook Success Rates**: Automation system reliability

### Health Checks
```bash
GET /api/chat
```
Returns system health status and service availability.

## 🛠 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Reusable UI components
│   ├── chat-interface.tsx
│   └── user-setup.tsx
├── lib/               # Utility libraries
│   ├── ai-service.ts  # OpenAI integration
│   ├── webhook-service.ts
│   ├── supabase.ts    # Database client
│   └── utils.ts       # Helper functions
├── types/             # TypeScript definitions
└── styles/            # CSS and styling
```

### Key Services
- **BukolaAIService**: Core AI logic with executive persona
- **WebhookService**: Make.com integration with retry logic
- **DatabaseService**: Supabase operations and analytics

## 🚢 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms
- **Netlify**: Full Next.js support with serverless functions
- **Railway**: Database and app hosting combined
- **Digital Ocean**: App Platform with managed databases

## 🤝 Contributing

### Adding New Features
1. Follow the established TypeScript patterns
2. Update types in `src/types/index.ts`
3. Add tests for new functionality
4. Update documentation

### Adding Company Documents
```typescript
// Use the admin API or direct database insertion
await DatabaseService.storeDocument({
  title: "New Policy Document",
  content: "Document content here...",
  type: "policy",
  department: "Operations",
  author: "Bukola Lukan",
  access_level: "public"
});
```

## 📄 License

This project is proprietary software developed for Gtext Holdings. Unauthorized reproduction or distribution is prohibited.

## 🆘 Support

For technical issues or feature requests:
- **Internal**: Contact IT Department
- **Development**: Create issue in project repository
- **Emergency**: Contact system administrators

---

**Built with ❤️ for operational excellence at Gtext Holdings**