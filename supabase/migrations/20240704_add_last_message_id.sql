-- Create function to add a column
CREATE OR REPLACE FUNCTION add_column(
    table_name text,
    column_name text,
    column_type text,
    is_nullable boolean
) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s %s',
        table_name,
        column_name,
        column_type,
        CASE WHEN is_nullable THEN 'NULL' ELSE 'NOT NULL' END
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to update last_message_ids
CREATE OR REPLACE FUNCTION update_last_message_ids()
RETURNS void AS $$
BEGIN
    UPDATE conversations c
    SET last_message_id = (
        SELECT id
        FROM messages m
        WHERE m.conversation_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to create an index
CREATE OR REPLACE FUNCTION create_index(
    table_name text,
    index_name text,
    column_name text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE tablename = table_name
        AND indexname = index_name
    ) THEN
        EXECUTE format('CREATE INDEX %I ON %I (%I)',
            index_name,
            table_name,
            column_name
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to execute SQL safely
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
    EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add last_message_id column to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL;

-- Update existing conversations with their latest message
UPDATE conversations c
SET last_message_id = (
    SELECT id
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
);

-- Create index for last_message_id
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_id ON conversations(last_message_id); 