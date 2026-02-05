DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- Disable triggers to avoid issues during truncate
    SET session_replication_role = 'replica';
    
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Re-enable triggers
    SET session_replication_role = 'origin';
END $$;
