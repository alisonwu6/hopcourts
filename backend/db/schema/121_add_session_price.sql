-- Add price and is_free to sessions table
DO $$
BEGIN
    -- Add is_free
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'is_free') THEN
        ALTER TABLE public.sessions 
        ADD COLUMN is_free boolean NOT NULL DEFAULT true;
    END IF;

    -- Add price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'price') THEN
        ALTER TABLE public.sessions
        ADD COLUMN price numeric(10, 2);
    END IF;
END $$;
