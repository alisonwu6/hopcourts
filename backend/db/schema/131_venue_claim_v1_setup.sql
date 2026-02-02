-- Migration: Venue Claim Flow v1.0
-- Purpose: Add contact fields to venue_claims and make owner_id optional for lead generation.

-- 1. Add basic and extended contact fields
ALTER TABLE public.venue_claims 
ADD COLUMN IF NOT EXISTS contact_name varchar(255),    -- 管理者名稱或公司名
ADD COLUMN IF NOT EXISTS contact_person varchar(255),  -- 聯絡人姓名
ADD COLUMN IF NOT EXISTS contact_title varchar(255),   -- 職務稱呼
ADD COLUMN IF NOT EXISTS contact_phone varchar(50),    -- 聯絡電話
ADD COLUMN IF NOT EXISTS contact_email varchar(255),   -- 聯絡 Email
ADD COLUMN IF NOT EXISTS note text;                    -- 補充說明

-- 2. Make owner_id optional (allow guests to apply)
ALTER TABLE public.venue_claims 
ALTER COLUMN owner_id DROP NOT NULL;

-- 3. Add helpful comments
COMMENT ON COLUMN public.venue_claims.owner_id IS 'Associated user ID if logged in, NULL for guest applications';
COMMENT ON COLUMN public.venue_claims.contact_name IS '管理者名稱或公司名';
COMMENT ON COLUMN public.venue_claims.contact_person IS '聯絡人姓名';
COMMENT ON COLUMN public.venue_claims.contact_title IS '職務稱呼';
COMMENT ON COLUMN public.venue_claims.contact_phone IS '聯絡電話';
COMMENT ON COLUMN public.venue_claims.contact_email IS '聯絡 Email';
COMMENT ON COLUMN public.venue_claims.note IS '補充說明 (選填)';
