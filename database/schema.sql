-- Bukola AI Clone Database Schema
-- This file contains the complete database schema for the Miss Bukola Lukan AI application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User Sessions Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) UNIQUE NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_interactions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Logs Table
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES user_sessions(user_id) ON DELETE CASCADE
);

-- Document Store Table (for RAG system)
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

-- Create indexes for performance
CREATE INDEX idx_conversation_logs_user_id ON conversation_logs(user_id);
CREATE INDEX idx_conversation_logs_created_at ON conversation_logs(created_at DESC);
CREATE INDEX idx_conversation_logs_request_mode ON conversation_logs(request_mode_enabled);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_department ON user_sessions(department);

CREATE INDEX idx_document_store_type ON document_store(type);
CREATE INDEX idx_document_store_department ON document_store(department);
CREATE INDEX idx_document_store_access_level ON document_store(access_level);
CREATE INDEX idx_document_store_is_active ON document_store(is_active);
CREATE INDEX idx_document_store_search_vector ON document_store USING GIN(search_vector);

-- Full-text search index for document content
CREATE INDEX idx_document_store_content_search ON document_store USING GIN(to_tsvector('english', content));

-- Trigger to update search_vector automatically
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', NEW.title || ' ' || NEW.content);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_search_vector
    BEFORE INSERT OR UPDATE ON document_store
    FOR EACH ROW
    EXECUTE FUNCTION update_document_search_vector();

-- Function to increment interaction count
CREATE OR REPLACE FUNCTION increment_interaction_count(user_id_param VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    new_count INTEGER;
BEGIN
    UPDATE user_sessions 
    SET total_interactions = total_interactions + 1,
        updated_at = NOW()
    WHERE user_id = user_id_param
    RETURNING total_interactions INTO new_count;
    
    RETURN COALESCE(new_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get conversation analytics
CREATE OR REPLACE FUNCTION get_conversation_analytics(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    total_conversations BIGINT,
    unique_users BIGINT,
    request_mode_conversations BIGINT,
    avg_conversations_per_user NUMERIC,
    top_departments JSON
) AS $$
BEGIN
    RETURN QUERY
    WITH conversation_stats AS (
        SELECT 
            COUNT(*) as total_convs,
            COUNT(DISTINCT cl.user_id) as unique_users_count,
            COUNT(*) FILTER (WHERE cl.request_mode_enabled = true) as request_mode_count
        FROM conversation_logs cl
        WHERE cl.created_at BETWEEN start_date AND end_date
    ),
    department_stats AS (
        SELECT 
            us.department,
            COUNT(cl.*) as conversation_count
        FROM conversation_logs cl
        JOIN user_sessions us ON cl.user_id = us.user_id
        WHERE cl.created_at BETWEEN start_date AND end_date
        GROUP BY us.department
        ORDER BY conversation_count DESC
        LIMIT 5
    )
    SELECT 
        cs.total_convs::BIGINT,
        cs.unique_users_count::BIGINT,
        cs.request_mode_count::BIGINT,
        CASE 
            WHEN cs.unique_users_count > 0 
            THEN (cs.total_convs::NUMERIC / cs.unique_users_count::NUMERIC)
            ELSE 0::NUMERIC
        END,
        (SELECT json_agg(row_to_json(ds)) FROM department_stats ds)::JSON
    FROM conversation_stats cs;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_store ENABLE ROW LEVEL SECURITY;

-- Allow all operations for service role
CREATE POLICY "Service role can manage user_sessions" ON user_sessions
    FOR ALL USING (true);

CREATE POLICY "Service role can manage conversation_logs" ON conversation_logs
    FOR ALL USING (true);

CREATE POLICY "Service role can manage document_store" ON document_store
    FOR ALL USING (true);

-- Insert sample data for testing
INSERT INTO user_sessions (user_id, employee_name, department, role) VALUES
('emp001', 'John Doe', 'Operations', 'Manager'),
('emp002', 'Jane Smith', 'Human Resources', 'Senior Associate'),
('emp003', 'Mike Johnson', 'Finance', 'Analyst'),
('emp004', 'Sarah Wilson', 'IT', 'Developer'),
('emp005', 'David Brown', 'Marketing', 'Coordinator');

-- Insert sample documents for RAG system
INSERT INTO document_store (title, content, type, department, author, access_level) VALUES
(
    'Gtext Holdings Leadership Philosophy and Core Values', 
    'Miss Bukola Lukan Leadership Mantra: "Bukola, lead right, and the people will follow." Leadership Philosophy: A confident woman radiates quiet strength—not through volume, but through clarity, emotional intelligence, and decisiveness. Loyalty must be modeled from the top before it can be expected from others. Leadership is not about aggression; it is about assertiveness. We are privileged shepherds, entrusted with guiding people toward purpose. Core Values: Energy, Excellence, Integrity, Innovation, Punctuality, Proactiveness, Good Leadership. Personality Traits for all leaders: Selflessness, Positivity, Innovation & Creativity, Integrity, Excellence, Loyalty.',
    'policy',
    'Operations',
    'Bukola Lukan',
    'public'
),
(
    'Gtext Holdings Subsidiaries Overview',
    'Gtext Holdings operates globally with subsidiaries across Nigeria, Dubai, Doha, and USA: 1) Stephen Akintayo Foundation - Educational empowerment and investment coaching 2) Gtext and Associates - Agent network raising 100,000 billionaires yearly through real estate 3) Gtext Suites - Dubai/Doha residency programs, golden visa, zero VAT properties 4) Gtext Land - Goal of 25,000 luxury serviced plots by 2035 across 200 estates, land banking from ₦5M 5) Gtext Homes - Luxury smart/green estates, largest global developer vision 6) Gtext Farms - Agribusiness, food security, wealth creation 7) Gtext Media - Content creation to increase visibility and property sales 8) Gvest - Fractional real estate investment platform, target 200,000 investors by 2027, ROI 14-26% annually.',
    'procedure',
    'Operations',
    'Bukola Lukan',
    'public'
),
(
    'Gvest Investment Platform Operations',
    'Gvest is the investment arm of Gtext Holdings, a digital cooperative registered with LASCOFED Nigeria and SEC USA. Investment Plans - Nigerians: ₦5M-₦1B (16-26% ROI), Americans: $10K-$2M (7-20% ROI). Returns paid annually or at tenure end. Features: Fractional real estate ownership, guaranteed returns, never defaulted, secured by underlying assets. New app launching August 2025 with investment tracking, loans, auto-debit, flexible savings, withdrawal control. Mission: Democratize real estate investment for wealth building. Target: 200,000 diverse investors by 2027.',
    'policy',
    'Investment',
    'Farouq Usman',
    'public'
),
(
    'Executive Decision Framework - Bukola Lukan Style',
    'Decision-making approach aligned with Miss Bukola Lukan philosophy: 1) Make decisive calls based on logic, performance data, and organizational goals 2) Do not micromanage but always follow up for accountability 3) Focus on solutions, not blame 4) Align all decisions with Chairman vision and group strategy 5) Prioritize people development and operational excellence. Emergency response: Remain calm, diplomatic, factual. Avoid blame, focus on solutions, end with actionable resolution steps. For underperformance: "Take ownership, be responsible" - clear, supportive accountability.',
    'policy',
    'Operations',
    'Bukola Lukan',
    'executive'
),
(
    'Communication Standards and Response Templates',
    'Miss Bukola Lukan Communication Style: Speak with calm confidence and quiet authority. Use phrases: "Let us lead right", "Take ownership, be responsible". Do not confuse noise for impact - focus on execution, consistency, integrity. Address people warmly but with clear expectations. End with actionable next steps and timelines. Response Patterns: For delays/problems - address proactively, request specifics with deadlines. For new team members - welcome warmly, set clear expectations about growth and impact. For meetings - focus on purpose, value-add, alignment with vision. For wins - acknowledge process and people, reinforce that success comes from leading right.',
    'guideline',
    'Operations',
    'Bukola Lukan',
    'management'
),
(
    'Gtext Holdings Global Vision and Mission',
    'Vision: To improve sustainable and healthy lifestyles for billions of people around the globe. Mission: To provide sustainable and healthy living worldwide through subsidiaries in Real Estate, Education, Healthcare, Organic Farming, Entertainment, Media. Founded by Dr. Stephen Akintayo in 2008, evolved from Gilead Balm to GText Holdings. Global presence: Nigeria, Dubai, USA, UK with expansion across continents. Identity: Africa leading conglomerate driving global economic growth, maximizing shareholder value, fostering economic growth in emerging markets for sustainable, impactful change for future generations.',
    'policy',
    'Operations',
    'Dr. Stephen Akintayo',
    'public'
),
(
    'Gtext Land Development Strategy',
    'Mission: Own 200 estates with over 25,000 sold Luxury Service Plots by 2035 across various continents using Natural Resources and Technology for wealth building through land banking. Vision: Be the largest Developer of luxurious Green and smart Estates. Current portfolio: Leading real estate development company committed to acquiring 5,000 Luxury Serviced Plots initially. Entry point: From ₦5M with 3-6 month balance spread. Locations: Lagos, Oyo, Abeokuta, Abuja, Port Harcourt. MD: Farouq Usman. Focus: Smart, secure, sustainable communities meeting modern homeowner and investor needs.',
    'procedure',
    'Real Estate',
    'Farouq Usman',
    'public'
),
(
    'Gtext Media Content Strategy',
    'MD: Farouq Usman. Vision: Raise content creators to increase Gtext Holdings visibility and drive property sales growth. Goal: Make money while teaching people content creation and product visibility. Mission: Address shortened attention spans in social media era. Strategy: Create unique content for business growth. Focus: Train content creators to perfection for brand promotion. Value: Media cannot be overemphasized in current social media landscape. Approach: Leverage changing content creation methods and shorter attention spans for business advantage.',
    'guideline',
    'Marketing',
    'Farouq Usman',
    'public'
);

-- Create updated_at trigger for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_logs_updated_at 
    BEFORE UPDATE ON conversation_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_store_updated_at 
    BEFORE UPDATE ON document_store 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();