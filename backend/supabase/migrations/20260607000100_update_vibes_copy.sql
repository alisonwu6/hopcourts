-- Up Migration: Update vibes table with new playful & frictionless copy (bilingual)
INSERT INTO vibes (key, name_zh, name_en, subtitle_zh, subtitle_en, sort, is_active, updated_at)
VALUES
  (
    'CHILL',
    '純放空飄過',
    'Just Floating',
    '沒計畫、沒壓力，單純出門曬太陽湊人數。',
    'No plans, no expectations. Just getting out of the house to soak up the atmosphere.',
    1, true, NOW()
  ),
  (
    'SOCIAL',
    '開心最重要',
    'Banter First',
    '來找樂子和大笑，球技不重要，好笑最重要。',
    'Here for the big laughs, high energy, and humans who don''t take themselves too seriously.',
    2, true, NOW()
  ),
  (
    'FLOW',
    '靜音模式',
    'Solo in Public',
    '戴上耳機、專注心流，享受一個人的公共孤獨。',
    'Headphones on, world off. Chasing my own rhythm while surrounded by your energy.',
    3, true, NOW()
  ),
  (
    'EXPLORER',
    '各種好奇心',
    'Curiously Open',
    '純新手、想開發新興趣。歡迎帶我解鎖新世界。',
    'Total beginner or trying something new. Show me the ropes, I''m here to discover a new passion.',
    4, true, NOW()
  ),
  (
    'GROWTH',
    '專注成長',
    'Leveling Up',
    '專注自我提升。不拼輸贏，純粹磨練動作技術。',
    'Focused on progress. Here to sharpen my skills, learn from the room, and get 1% better today.',
    5, true, NOW()
  ),
  (
    'COMPETITIVE',
    '今天來真的',
    'Full Send',
    '火力全開、強度拉滿。來一場痛快的實力對決。',
    'Locked in and hyper-focused. Ready to push boundaries and break a proper sweat today.',
    6, true, NOW()
  ),
  (
    'SUPPORTIVE',
    '有我罩你',
    'Safety Net',
    '絕對零壓力。不管多菜我都陪你練、幫你撿球。',
    'Zero judgment zone. Happy to welcome absolute beginners and play at any pace.',
    7, true, NOW()
  )
ON CONFLICT (key) DO UPDATE SET
  name_zh = EXCLUDED.name_zh,
  name_en = EXCLUDED.name_en,
  subtitle_zh = EXCLUDED.subtitle_zh,
  subtitle_en = EXCLUDED.subtitle_en,
  sort = EXCLUDED.sort,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
