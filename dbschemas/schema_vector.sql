-- ============================================================================
-- Vector Embedding Extension for News Collection Database
-- ============================================================================
-- This schema extends the existing news collection database with vector
-- embeddings for semantic search and RAG applications.

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- MESSAGE_CHUNKS TABLE
-- ============================================================================
-- Stores text chunks and their embeddings from messages
CREATE TABLE IF NOT EXISTS message_chunks (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL,                 -- References messages.id
    chunk_index INTEGER NOT NULL,               -- Order of chunk within message
    chunk_text TEXT NOT NULL,                   -- Cleaned and chunked text
    embedding vector(1024),                     -- BGE-M3 produces 1024-dim vectors
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    UNIQUE (message_id, chunk_index)            -- Prevent duplicate chunks
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_chunks_message_id ON message_chunks(message_id);

-- HNSW index for fast and accurate vector similarity search
-- m: max connections per layer (16 is good default, higher = better recall but more memory)
-- ef_construction: size of dynamic candidate list (64 is default, higher = better quality but slower build)
CREATE INDEX IF NOT EXISTS idx_message_chunks_embedding ON message_chunks 
    USING hnsw (embedding vector_cosine_ops) 
    WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- PROCESSING_LOG TABLE
-- ============================================================================
-- Tracks processing status and errors for debugging
CREATE TABLE IF NOT EXISTS processing_log (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT,
    status TEXT NOT NULL,                       -- 'success', 'skipped', 'error'
    reason TEXT,                                -- Why it was skipped/failed
    chunks_created INTEGER DEFAULT 0,           -- Number of chunks created
    processing_time_ms INTEGER,                 -- Processing time in milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_processing_log_message_id ON processing_log(message_id);
CREATE INDEX IF NOT EXISTS idx_processing_log_status ON processing_log(status);
CREATE INDEX IF NOT EXISTS idx_processing_log_created_at ON processing_log(created_at);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE message_chunks IS 'Text chunks and embeddings for semantic search';
COMMENT ON COLUMN message_chunks.embedding IS 'BGE-M3 1024-dimensional vector embedding';
COMMENT ON COLUMN message_chunks.chunk_index IS 'Sequential order of chunk within original message';

COMMENT ON TABLE processing_log IS 'Audit log for embedding processing pipeline';
COMMENT ON COLUMN processing_log.status IS 'Processing outcome: success, skipped, or error';
COMMENT ON COLUMN processing_log.reason IS 'Explanation for skipped or failed processing';
