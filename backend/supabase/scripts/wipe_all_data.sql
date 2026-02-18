DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Disable triggers to avoid issues during truncate
    SET session_replication_role = 'replica';
    
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        -- AND tablename NOT IN (
        --     'sports', 'countries','cities','vibes' -- 這裡放你要保留的表
        -- )
    ) LOOP
        EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE;', r.tablename);
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
END $$;
