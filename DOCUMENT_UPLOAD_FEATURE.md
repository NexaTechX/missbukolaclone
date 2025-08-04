# Document Upload and Conversation History Features

## Overview

This update adds two major features to the Miss Bukola AI application:

1. **Document Upload System** - Allows users to upload documents to improve the AI's knowledge base
2. **Conversation History** - Tracks and displays all conversations with the AI for analysis and improvement

## Document Upload Feature

### How it Works

Users can upload documents (currently TXT files, with PDF/DOC support planned) to enhance the AI's knowledge base. Uploaded documents are:

- Stored in the `document_store` table
- Indexed for full-text search
- Made available to the AI for context in responses
- Categorized by type, department, and access level

### Features

- **File Validation**: Supports TXT files (10MB max)
- **Metadata Capture**: Title, type, department, author, access level
- **Search Integration**: Documents are automatically indexed for AI retrieval
- **Access Control**: Public, Management, and Executive access levels
- **Audit Trail**: All uploads are logged in conversation history

### Usage

1. Click the upload icon (📤) in the chat header
2. Select a document file
3. Fill in the required metadata
4. Submit to add to the knowledge base

## Conversation History Feature

### How it Works

Every conversation with the AI is automatically logged to the database, including:

- User messages and AI responses
- Request mode interactions
- Task generation and webhook status
- Timestamps and user information

### Features

- **Search & Filter**: Find conversations by content or type
- **Detailed View**: See full conversation context and metadata
- **Task Tracking**: View generated tasks and webhook responses
- **Export Ready**: Data is structured for analysis

### Usage

1. Click the history icon (📋) in the chat header
2. Browse or search through past conversations
3. Click on any conversation to view full details
4. Filter by conversation type (All, Request Mode, Regular)

## Database Schema

### Document Store Table
```sql
CREATE TABLE document_store (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'procedure', 'guideline', 'memo', 'report')),
    department VARCHAR(100),
    author VARCHAR(255) NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('public', 'management', 'executive')),
    search_vector TSVECTOR
);
```

### Conversation Logs Table
```sql
CREATE TABLE conversation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    request_mode_enabled BOOLEAN DEFAULT FALSE,
    task_generated JSONB,
    webhook_sent BOOLEAN DEFAULT FALSE,
    webhook_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Document Upload
- **POST** `/api/documents` - Upload a new document
- **GET** `/api/documents` - Retrieve documents with filters

### Conversation History
- **GET** `/api/chat/history` - Fetch conversation history for a user

## Components

### DocumentUpload
- Modal interface for file upload
- Form validation and error handling
- Success/error feedback
- Auto-close on successful upload

### ConversationHistory
- Split-panel interface (list + detail view)
- Search and filter functionality
- Real-time data loading
- Responsive design

## Benefits

### For Users
- **Enhanced AI Knowledge**: Upload relevant documents to improve AI responses
- **Conversation Tracking**: Review past interactions and decisions
- **Task History**: Track all generated tasks and their status

### For Administrators
- **Usage Analytics**: Understand how the AI is being used
- **Content Management**: Monitor uploaded documents and their impact
- **Quality Improvement**: Identify areas for AI enhancement

### For AI Training
- **Data Collection**: Rich conversation data for model improvement
- **Document Corpus**: Growing knowledge base for better responses
- **Pattern Recognition**: Identify common queries and response patterns

## Future Enhancements

### Document Processing
- PDF text extraction
- Word document parsing
- Image OCR for scanned documents
- Automatic metadata extraction

### Analytics Dashboard
- Upload statistics
- Conversation analytics
- User engagement metrics
- AI performance tracking

### Advanced Features
- Document versioning
- Collaborative editing
- Approval workflows
- Integration with external systems

## Security Considerations

- File type validation
- Size limits (10MB max)
- Access level controls
- User authentication
- Audit logging

## Performance Optimizations

- Full-text search indexing
- Pagination for large datasets
- Caching for frequently accessed documents
- Efficient query patterns

## Troubleshooting

### Common Issues

1. **Upload Fails**: Check file type and size
2. **History Not Loading**: Verify database connection
3. **Search Not Working**: Ensure search indexes are created

### Debug Steps

1. Check browser console for errors
2. Verify API endpoint responses
3. Confirm database connectivity
4. Review server logs

## Configuration

### Environment Variables
Ensure these are set for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup
Run the schema.sql file to create necessary tables and indexes.

## Support

For issues or questions about these features, contact the development team or check the application logs for detailed error information. 