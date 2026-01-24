-- Add skill_level, gender, and photos to sessions table
DO $$
BEGIN
    -- Add skill_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'skill_level') THEN
        ALTER TABLE public.sessions 
        ADD COLUMN skill_level text NOT NULL DEFAULT 'any';

        ALTER TABLE public.sessions
        ADD CONSTRAINT sessions_skill_level_chk 
        CHECK (skill_level IN ('any', 'beginner', 'intermediate', 'advanced'));
    END IF;

    -- Add gender
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'gender') THEN
        ALTER TABLE public.sessions
        ADD COLUMN gender text NOT NULL DEFAULT 'mixed';

        ALTER TABLE public.sessions
        ADD CONSTRAINT sessions_gender_chk
        CHECK (gender IN ('mixed', 'female_only', 'male_only'));
    END IF;

    -- Add photos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sessions' AND column_name = 'photos') THEN
        ALTER TABLE public.sessions
        ADD COLUMN photos text[];
    END IF;
END $$;
