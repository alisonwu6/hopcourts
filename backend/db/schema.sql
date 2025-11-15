


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."demo_notes" (
    "id" bigint NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text"
);


ALTER TABLE "public"."demo_notes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."demo_notes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."demo_notes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."demo_notes_id_seq" OWNED BY "public"."demo_notes"."id";



CREATE TABLE IF NOT EXISTS "public"."game_members" (
    "game_id" bigint NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."game_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" integer NOT NULL,
    "creator_id" integer NOT NULL,
    "venue_id" integer,
    "title" "text" NOT NULL,
    "sport" "text" NOT NULL,
    "description" "text",
    "skill_level" "text" DEFAULT 'mixed'::"text",
    "energy" integer DEFAULT 60,
    "location_name" "text",
    "location_address" "text",
    "area" "text",
    "city" "text",
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "max_players" integer NOT NULL,
    "price" numeric(10,2) DEFAULT 0,
    "currency" "text" DEFAULT 'AUD'::"text",
    "requires_approval" boolean DEFAULT false,
    "status" "text" DEFAULT 'scheduled'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cancel_reason" "text",
    CONSTRAINT "games_skill_level_check" CHECK (("skill_level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text", 'mixed'::"text"]))),
    CONSTRAINT "games_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."games" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."games_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."games_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."games_id_seq" OWNED BY "public"."games"."id";



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" integer NOT NULL,
    "game_id" integer NOT NULL,
    "sender_id" integer NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."messages_id_seq" OWNED BY "public"."messages"."id";



CREATE TABLE IF NOT EXISTS "public"."player_game_joins" (
    "id" integer NOT NULL,
    "game_id" integer NOT NULL,
    "player_id" integer NOT NULL,
    "status" "text" DEFAULT 'joined'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "player_game_joins_status_check" CHECK (("status" = ANY (ARRAY['joined'::"text", 'cancelled'::"text", 'waitlisted'::"text"])))
);


ALTER TABLE "public"."player_game_joins" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."player_game_joins_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."player_game_joins_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."player_game_joins_id_seq" OWNED BY "public"."player_game_joins"."id";



CREATE TABLE IF NOT EXISTS "public"."player_preferred_areas" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "area_name" "text" NOT NULL,
    "postal_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."player_preferred_areas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."player_preferred_areas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."player_preferred_areas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."player_preferred_areas_id_seq" OWNED BY "public"."player_preferred_areas"."id";



CREATE TABLE IF NOT EXISTS "public"."player_sports" (
    "id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "sport" "text" NOT NULL,
    "skill_level" "text" NOT NULL,
    "playing_style" "text" DEFAULT 'mixed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "player_sports_playing_style_check" CHECK (("playing_style" = ANY (ARRAY['social'::"text", 'competitive'::"text", 'learning'::"text", 'mixed'::"text"]))),
    CONSTRAINT "player_sports_skill_level_check" CHECK (("skill_level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"])))
);


ALTER TABLE "public"."player_sports" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."player_sports_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."player_sports_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."player_sports_id_seq" OWNED BY "public"."player_sports"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auth_uid" "uuid",
    "username" "extensions"."citext",
    "display_name" "text",
    "gender" "text",
    "city" "text",
    "country" "text",
    "about" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" integer NOT NULL,
    "email" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "full_name" "text" NOT NULL,
    "username" "text",
    "role" "text" DEFAULT 'player'::"text" NOT NULL,
    "city" "text",
    "gender" "text",
    "bio" "text",
    "avatar_url" "text",
    "motivation" "text",
    "onboarding_status" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['player'::"text", 'venue_manager'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."users_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";



CREATE TABLE IF NOT EXISTS "public"."venue_sports" (
    "id" integer NOT NULL,
    "venue_id" integer NOT NULL,
    "sport" "text" NOT NULL
);


ALTER TABLE "public"."venue_sports" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."venue_sports_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."venue_sports_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."venue_sports_id_seq" OWNED BY "public"."venue_sports"."id";



CREATE TABLE IF NOT EXISTS "public"."venues" (
    "id" integer NOT NULL,
    "manager_id" integer NOT NULL,
    "name" "text" NOT NULL,
    "address" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "description" "text",
    "phone" "text",
    "email" "text",
    "website" "text",
    "photo_url" "text",
    "verified" boolean DEFAULT false NOT NULL,
    "latitude" numeric(10,7),
    "longitude" numeric(10,7),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."venues" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."venues_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."venues_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."venues_id_seq" OWNED BY "public"."venues"."id";



ALTER TABLE ONLY "public"."demo_notes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."demo_notes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."games" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."games_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."player_game_joins" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."player_game_joins_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."player_preferred_areas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."player_preferred_areas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."player_sports" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."player_sports_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."venue_sports" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."venue_sports_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."venues" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."venues_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."demo_notes"
    ADD CONSTRAINT "demo_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."game_members"
    ADD CONSTRAINT "game_members_pkey" PRIMARY KEY ("game_id", "profile_id");



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_game_joins"
    ADD CONSTRAINT "player_game_joins_game_id_player_id_key" UNIQUE ("game_id", "player_id");



ALTER TABLE ONLY "public"."player_game_joins"
    ADD CONSTRAINT "player_game_joins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_preferred_areas"
    ADD CONSTRAINT "player_preferred_areas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."player_sports"
    ADD CONSTRAINT "player_sports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_auth_uid_key" UNIQUE ("auth_uid");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."venue_sports"
    ADD CONSTRAINT "venue_sports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_games_sport" ON "public"."games" USING "btree" ("sport");



CREATE INDEX "idx_games_start_time" ON "public"."games" USING "btree" ("start_time");



ALTER TABLE ONLY "public"."game_members"
    ADD CONSTRAINT "game_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."player_game_joins"
    ADD CONSTRAINT "player_game_joins_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."player_game_joins"
    ADD CONSTRAINT "player_game_joins_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."player_preferred_areas"
    ADD CONSTRAINT "player_preferred_areas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."player_sports"
    ADD CONSTRAINT "player_sports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venue_sports"
    ADD CONSTRAINT "venue_sports_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."venues"
    ADD CONSTRAINT "venues_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."game_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "gm_delete_self" ON "public"."game_members" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "game_members"."profile_id") AND ("p"."auth_uid" = "auth"."uid"())))));



CREATE POLICY "gm_read_self" ON "public"."game_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "game_members"."profile_id") AND ("p"."auth_uid" = "auth"."uid"())))));



CREATE POLICY "gm_write_self" ON "public"."game_members" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "game_members"."profile_id") AND ("p"."auth_uid" = "auth"."uid"())))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_self_rw" ON "public"."profiles" USING (("auth"."uid"() = "auth_uid")) WITH CHECK (("auth"."uid"() = "auth_uid"));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."demo_notes" TO "anon";
GRANT ALL ON TABLE "public"."demo_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."demo_notes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."demo_notes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."demo_notes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."demo_notes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."game_members" TO "anon";
GRANT ALL ON TABLE "public"."game_members" TO "authenticated";
GRANT ALL ON TABLE "public"."game_members" TO "service_role";



GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";



GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."player_game_joins" TO "anon";
GRANT ALL ON TABLE "public"."player_game_joins" TO "authenticated";
GRANT ALL ON TABLE "public"."player_game_joins" TO "service_role";



GRANT ALL ON SEQUENCE "public"."player_game_joins_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_game_joins_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_game_joins_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."player_preferred_areas" TO "anon";
GRANT ALL ON TABLE "public"."player_preferred_areas" TO "authenticated";
GRANT ALL ON TABLE "public"."player_preferred_areas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."player_preferred_areas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_preferred_areas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_preferred_areas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."player_sports" TO "anon";
GRANT ALL ON TABLE "public"."player_sports" TO "authenticated";
GRANT ALL ON TABLE "public"."player_sports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."player_sports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_sports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_sports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."users_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."venue_sports" TO "anon";
GRANT ALL ON TABLE "public"."venue_sports" TO "authenticated";
GRANT ALL ON TABLE "public"."venue_sports" TO "service_role";



GRANT ALL ON SEQUENCE "public"."venue_sports_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."venue_sports_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."venue_sports_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."venues" TO "anon";
GRANT ALL ON TABLE "public"."venues" TO "authenticated";
GRANT ALL ON TABLE "public"."venues" TO "service_role";



GRANT ALL ON SEQUENCE "public"."venues_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."venues_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."venues_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







