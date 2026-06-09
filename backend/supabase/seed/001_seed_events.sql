-- Seed: 100 events across all sports, June–July 2026
-- Hosts: existing users only
-- Run with: psql -h 127.0.0.1 -p 54422 -U postgres -d postgres -f this_file.sql

SET session_replication_role = replica; -- bypass RLS for seeding

DO $$
DECLARE
  alison UUID := 'b743c889-ed0f-496d-83fc-c3f4f9264a18';
  chialin UUID := 'a66ba486-e722-40a3-b8ba-774d826287e9';
BEGIN

INSERT INTO sessions (host_user_id, sport_key, title, starts_at, ends_at, place_name, address, lat, lng, skill_level, gender, min_people, max_people, status, visibility, is_free) VALUES

-- BASKETBALL (7)
(alison,   'BASKETBALL', '大安籃球3on3',       '2026-06-11 08:00+08', '2026-06-11 10:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'intermediate', 'mixed',  4, 12, 'published', 'public', true),
(chialin,  'BASKETBALL', '信義區鬥牛場',         '2026-06-17 19:00+08', '2026-06-17 21:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'any',          'mixed',  2, 10, 'published', 'public', true),
(alison,   'BASKETBALL', '週末男子籃球友誼賽',   '2026-06-21 09:00+08', '2026-06-21 12:00+08', '天母運動公園', '台北市士林區中山北路七段', 25.1011, 121.5241, 'intermediate', 'male',   5, 15, 'published', 'public', true),
(chialin,  'BASKETBALL', '板橋5v5歡迎新手',      '2026-06-28 14:00+08', '2026-06-28 17:00+08', '板橋體育館', '新北市板橋區中山路一段', 25.0139, 121.4628, 'beginner',     'mixed',  5, 10, 'published', 'public', true),
(alison,   'BASKETBALL', '夜間籃球局',           '2026-07-05 20:00+08', '2026-07-05 22:00+08', '內湖運動中心', '台北市內湖區內湖路一段', 25.0814, 121.5713, 'any',          'mixed',  4,  8, 'published', 'public', true),
(chialin,  'BASKETBALL', '中正籃球聯誼',         '2026-07-12 09:00+08', '2026-07-12 11:30+08', '中正運動中心', '台北市中正區愛國西路', 25.0345, 121.5178, 'intermediate', 'mixed',  6, 12, 'published', 'public', true),
(alison,   'BASKETBALL', '暑期進階訓練局',       '2026-07-26 10:00+08', '2026-07-26 13:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'advanced',     'mixed',  6, 10, 'published', 'public', true),

-- BADMINTON (8)
(chialin,  'BADMINTON', '信義羽球包場',          '2026-06-10 07:00+08', '2026-06-10 09:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'intermediate', 'mixed',  4,  8, 'published', 'public', true),
(alison,   'BADMINTON', '週間羽球揪人',          '2026-06-13 18:00+08', '2026-06-13 20:00+08', '永和運動中心', '新北市永和區中正路', 25.0082, 121.5195, 'any',          'mixed',  2,  8, 'published', 'public', true),
(chialin,  'BADMINTON', '新手羽球同樂會',        '2026-06-20 10:00+08', '2026-06-20 12:00+08', '中和運動中心', '新北市中和區中正路', 24.9950, 121.5069, 'beginner',     'mixed',  2,  6, 'published', 'public', true),
(alison,   'BADMINTON', '雙打友誼賽',            '2026-06-25 19:00+08', '2026-06-25 21:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'intermediate', 'mixed',  4,  8, 'published', 'public', true),
(chialin,  'BADMINTON', '羽球混雙揪',            '2026-07-02 08:00+08', '2026-07-02 10:00+08', '天母運動中心', '台北市士林區中山北路七段', 25.1011, 121.5241, 'any',          'mixed',  4,  8, 'published', 'public', true),
(alison,   'BADMINTON', '進階羽球切磋',          '2026-07-09 19:00+08', '2026-07-09 21:30+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'advanced',     'mixed',  4,  6, 'published', 'public', true),
(chialin,  'BADMINTON', '假日羽球開放局',        '2026-07-19 09:00+08', '2026-07-19 12:00+08', '板橋體育館', '新北市板橋區中山路一段', 25.0139, 121.4628, 'any',          'mixed',  4, 12, 'published', 'public', true),
(alison,   'BADMINTON', '暑假羽球集訓',          '2026-07-29 18:00+08', '2026-07-29 21:00+08', '內湖運動中心', '台北市內湖區內湖路一段', 25.0814, 121.5713, 'intermediate', 'mixed',  4,  8, 'published', 'public', true),

-- TABLE_TENNIS (6)
(chialin,  'TABLE_TENNIS', '桌球同好聚',         '2026-06-12 14:00+08', '2026-06-12 16:00+08', '中正運動中心', '台北市中正區愛國西路', 25.0345, 121.5178, 'any',          'mixed',  2,  8, 'published', 'public', true),
(alison,   'TABLE_TENNIS', '週間桌球練習',       '2026-06-19 19:00+08', '2026-06-19 21:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'intermediate', 'mixed',  2,  6, 'published', 'public', true),
(chialin,  'TABLE_TENNIS', '新手桌球日',         '2026-06-27 10:00+08', '2026-06-27 12:00+08', '永和運動中心', '新北市永和區中正路', 25.0082, 121.5195, 'beginner',     'mixed',  2,  4, 'published', 'public', true),
(alison,   'TABLE_TENNIS', '桌球友誼單打',       '2026-07-07 19:00+08', '2026-07-07 21:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'intermediate', 'mixed',  2,  4, 'published', 'public', true),
(chialin,  'TABLE_TENNIS', '週末雙打桌球局',     '2026-07-18 09:00+08', '2026-07-18 11:00+08', '中和運動中心', '新北市中和區中正路', 24.9950, 121.5069, 'any',          'mixed',  4,  8, 'published', 'public', true),
(alison,   'TABLE_TENNIS', '進階桌球對戰',       '2026-07-25 14:00+08', '2026-07-25 17:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'advanced',     'mixed',  2,  6, 'published', 'public', true),

-- VOLLEYBALL (6)
(chialin,  'VOLLEYBALL', '沙灘排球午後局',       '2026-06-14 14:00+08', '2026-06-14 17:00+08', '福隆海水浴場', '新北市貢寮區福隆街', 25.0228, 121.9591, 'any',          'mixed',  6, 12, 'published', 'public', true),
(alison,   'VOLLEYBALL', '室內6v6排球',          '2026-06-22 09:00+08', '2026-06-22 12:00+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'intermediate', 'mixed',  6, 12, 'published', 'public', true),
(chialin,  'VOLLEYBALL', '排球揪新手',           '2026-06-29 19:00+08', '2026-06-29 21:00+08', '板橋體育館', '新北市板橋區中山路一段', 25.0139, 121.4628, 'beginner',     'mixed',  6, 12, 'published', 'public', true),
(alison,   'VOLLEYBALL', '週末排球同樂',         '2026-07-05 09:00+08', '2026-07-05 12:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'any',          'mixed',  6, 12, 'published', 'public', true),
(chialin,  'VOLLEYBALL', '女子排球局',           '2026-07-13 14:00+08', '2026-07-13 17:00+08', '天母運動公園', '台北市士林區中山北路七段', 25.1011, 121.5241, 'intermediate', 'female', 6, 12, 'published', 'public', true),
(alison,   'VOLLEYBALL', '暑期排球訓練',         '2026-07-27 09:00+08', '2026-07-27 12:00+08', '中正運動中心', '台北市中正區愛國西路', 25.0345, 121.5178, 'advanced',     'mixed',  6, 10, 'published', 'public', true),

-- TENNIS (6)
(alison,   'TENNIS', '網球雙打揪',               '2026-06-11 07:00+08', '2026-06-11 09:00+08', '大安森林公園網球場', '台北市大安區新生南路二段', 25.0295, 121.5353, 'intermediate', 'mixed',  4,  4, 'published', 'public', true),
(chialin,  'TENNIS', '週末網球練習',             '2026-06-20 07:30+08', '2026-06-20 09:30+08', '天母棒球場旁網球場', '台北市士林區天母西路', 25.1021, 121.5218, 'any',          'mixed',  2,  4, 'published', 'public', true),
(alison,   'TENNIS', '進階網球對打',             '2026-07-01 06:30+08', '2026-07-01 08:30+08', '大安森林公園網球場', '台北市大安區新生南路二段', 25.0295, 121.5353, 'advanced',     'mixed',  2,  4, 'published', 'public', true),
(chialin,  'TENNIS', '網球新手歡迎局',           '2026-07-08 07:00+08', '2026-07-08 09:00+08', '中正紀念堂外網球場', '台北市中正區中山南路', 25.0351, 121.5212, 'beginner',     'mixed',  2,  6, 'published', 'public', true),
(alison,   'TENNIS', '女子網球同好',             '2026-07-15 07:00+08', '2026-07-15 09:00+08', '天母棒球場旁網球場', '台北市士林區天母西路', 25.1021, 121.5218, 'intermediate', 'female', 2,  4, 'published', 'public', true),
(chialin,  'TENNIS', '暑假網球聯誼',             '2026-07-22 07:30+08', '2026-07-22 10:00+08', '大安森林公園網球場', '台北市大安區新生南路二段', 25.0295, 121.5353, 'any',          'mixed',  4,  8, 'published', 'public', true),

-- PICKLEBALL (7)
(alison,   'PICKLEBALL', '匹克球入門體驗',       '2026-06-13 10:00+08', '2026-06-13 12:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'beginner',     'mixed',  4,  8, 'published', 'public', true),
(chialin,  'PICKLEBALL', '週末匹克球雙打',       '2026-06-21 09:00+08', '2026-06-21 11:30+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'intermediate', 'mixed',  4,  8, 'published', 'public', true),
(alison,   'PICKLEBALL', '匹克球揪戰',           '2026-06-28 14:00+08', '2026-06-28 16:30+08', '中和運動中心', '新北市中和區中正路', 24.9950, 121.5069, 'any',          'mixed',  4,  8, 'published', 'public', true),
(chialin,  'PICKLEBALL', '進階匹克球對戰',       '2026-07-04 10:00+08', '2026-07-04 12:30+08', '板橋體育館', '新北市板橋區中山路一段', 25.0139, 121.4628, 'advanced',     'mixed',  4,  8, 'published', 'public', true),
(alison,   'PICKLEBALL', '匹克球女子同好',       '2026-07-11 09:00+08', '2026-07-11 11:00+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'any',          'female', 4,  8, 'published', 'public', true),
(chialin,  'PICKLEBALL', '暑假匹克球開放局',     '2026-07-19 10:00+08', '2026-07-19 12:30+08', '天母運動中心', '台北市士林區中山北路七段', 25.1011, 121.5241, 'intermediate', 'mixed',  4,  8, 'published', 'public', true),
(alison,   'PICKLEBALL', '下午匹克球同樂',       '2026-07-26 14:00+08', '2026-07-26 16:30+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'any',          'mixed',  4,  8, 'published', 'public', true),

-- RUNNING (7)
(chialin,  'RUNNING', '大安森林公園晨跑',        '2026-06-10 06:00+08', '2026-06-10 07:30+08', '大安森林公園', '台北市大安區新生南路二段', 25.0295, 121.5353, 'any',          'mixed',  2, 20, 'published', 'public', true),
(alison,   'RUNNING', '河濱自行車道慢跑',        '2026-06-17 06:30+08', '2026-06-17 08:00+08', '台北市河濱公園', '台北市中山區濱江街', 25.0746, 121.5399, 'any',          'mixed',  2, 30, 'published', 'public', true),
(chialin,  'RUNNING', '植物園晨跑聚',            '2026-06-24 06:00+08', '2026-06-24 07:30+08', '台北植物園', '台北市中正區南海路', 25.0329, 121.5099, 'beginner',     'mixed',  2, 20, 'published', 'public', true),
(alison,   'RUNNING', '信義夜跑局',              '2026-07-01 20:00+08', '2026-07-01 21:30+08', '信義公民會館', '台北市信義區松仁路', 25.0337, 121.5658, 'any',          'mixed',  2, 30, 'published', 'public', true),
(chialin,  'RUNNING', '新莊河堤公路晨跑',        '2026-07-08 06:00+08', '2026-07-08 07:30+08', '新莊河堤公園', '新北市新莊區思源路', 25.0332, 121.4440, 'intermediate', 'mixed',  2, 20, 'published', 'public', true),
(alison,   'RUNNING', '三峽河濱晨跑',            '2026-07-15 06:00+08', '2026-07-15 07:30+08', '三峽河濱公園', '新北市三峽區介壽路', 24.9343, 121.3696, 'any',          'mixed',  2, 20, 'published', 'public', true),
(chialin,  'RUNNING', '暑假大安公園晨跑',        '2026-07-25 06:00+08', '2026-07-25 07:30+08', '大安森林公園', '台北市大安區新生南路二段', 25.0295, 121.5353, 'any',          'mixed',  2, 30, 'published', 'public', true),

-- CYCLING (7)
(alison,   'CYCLING', '淡水河自行車道',          '2026-06-14 06:30+08', '2026-06-14 10:30+08', '大稻埕碼頭', '台北市大同區延平北路', 25.0566, 121.5106, 'any',          'mixed',  2, 20, 'published', 'public', true),
(chialin,  'CYCLING', '北海岸海岸公路',          '2026-06-21 06:00+08', '2026-06-21 12:00+08', '金山遊客中心', '新北市金山區中山路', 25.2243, 121.6393, 'intermediate', 'mixed',  2, 15, 'published', 'public', true),
(alison,   'CYCLING', '關渡平原賞鳥騎',          '2026-06-28 07:00+08', '2026-06-28 10:00+08', '關渡自然公園', '台北市北投區關渡路', 25.1170, 121.4644, 'any',          'mixed',  2, 20, 'published', 'public', true),
(chialin,  'CYCLING', '三重河濱公路',            '2026-07-05 06:00+08', '2026-07-05 09:00+08', '三重疏洪道公園', '新北市三重區中興南街', 25.0619, 121.4858, 'beginner',     'mixed',  2, 15, 'published', 'public', true),
(alison,   'CYCLING', '陽明山假日騎行',          '2026-07-12 07:00+08', '2026-07-12 12:00+08', '陽明山國家公園', '台北市士林區格致路', 25.1537, 121.5427, 'advanced',     'mixed',  2, 10, 'published', 'public', true),
(chialin,  'CYCLING', '木柵貓纜周邊騎',          '2026-07-19 07:00+08', '2026-07-19 10:00+08', '政大附近河濱', '台北市文山區指南路', 24.9897, 121.5766, 'any',          'mixed',  2, 15, 'published', 'public', true),
(alison,   'CYCLING', '暑假淡水騎行趣',          '2026-07-26 06:30+08', '2026-07-26 11:00+08', '淡水老街', '新北市淡水區中正路', 25.1701, 121.4415, 'intermediate', 'mixed',  2, 20, 'published', 'public', true),

-- HIKING (7)
(chialin,  'HIKING', '象山日出健行',             '2026-06-09 05:30+08', '2026-06-09 08:00+08', '象山自然步道', '台北市信義區虎山路', 25.0271, 121.5760, 'any',          'mixed',  2, 20, 'published', 'public', true),
(alison,   'HIKING', '七星山主峰攻頂',           '2026-06-15 07:00+08', '2026-06-15 13:00+08', '陽明山冷水坑', '台北市士林區菁山路', 25.1633, 121.5533, 'intermediate', 'mixed',  2, 15, 'published', 'public', true),
(chialin,  'HIKING', '虎山步道輕鬆走',           '2026-06-22 07:00+08', '2026-06-22 10:00+08', '虎山溪步道', '台北市信義區虎山路', 25.0340, 121.5780, 'beginner',     'mixed',  2, 20, 'published', 'public', true),
(alison,   'HIKING', '二子坪賞花健行',           '2026-06-29 08:00+08', '2026-06-29 13:00+08', '陽明山二子坪', '台北市北投區陽金公路', 25.1701, 121.5215, 'any',          'mixed',  2, 20, 'published', 'public', true),
(chialin,  'HIKING', '碧潭步道輕走',             '2026-07-06 07:00+08', '2026-07-06 10:00+08', '碧潭公園', '新北市新店區碧潭路', 24.9637, 121.5401, 'beginner',     'mixed',  2, 15, 'published', 'public', true),
(alison,   'HIKING', '石碇峰頂探索',             '2026-07-13 06:30+08', '2026-07-13 13:00+08', '石碇老街', '新北市石碇區石碇西街', 24.9904, 121.6311, 'intermediate', 'mixed',  2, 12, 'published', 'public', true),
(chialin,  'HIKING', '暑期群山健行',             '2026-07-20 06:00+08', '2026-07-20 14:00+08', '七星山主峰', '台北市北投區陽金公路', 25.1744, 121.5467, 'advanced',     'mixed',  2, 10, 'published', 'public', true),

-- BOULDERING (6)
(alison,   'BOULDERING', '抱石入門課',           '2026-06-11 14:00+08', '2026-06-11 16:00+08', 'Bouldering Taiwan', '台北市中山區', 25.0627, 121.5328, 'beginner', 'mixed', 2,  8, 'published', 'public', false),
(chialin,  'BOULDERING', '週末抱石訓練',         '2026-06-20 11:00+08', '2026-06-20 14:00+08', 'Bouldering Taiwan', '台北市中山區', 25.0627, 121.5328, 'intermediate', 'mixed', 2, 10, 'published', 'public', false),
(alison,   'BOULDERING', '進階路線刷題',         '2026-06-27 11:00+08', '2026-06-27 14:00+08', 'The Wall 攀岩館', '台北市大安區', 25.0214, 121.5362, 'advanced', 'mixed', 2,  6, 'published', 'public', false),
(chialin,  'BOULDERING', '夜間抱石互助',         '2026-07-08 19:00+08', '2026-07-08 22:00+08', 'Bouldering Taiwan', '台北市中山區', 25.0627, 121.5328, 'any', 'mixed', 2,  8, 'published', 'public', false),
(alison,   'BOULDERING', '暑假女子抱石日',       '2026-07-16 11:00+08', '2026-07-16 14:00+08', 'The Wall 攀岩館', '台北市大安區', 25.0214, 121.5362, 'beginner', 'female', 2,  6, 'published', 'public', false),
(chialin,  'BOULDERING', '路線競速挑戰',         '2026-07-25 14:00+08', '2026-07-25 17:00+08', 'Bouldering Taiwan', '台北市中山區', 25.0627, 121.5328, 'advanced', 'mixed', 4,  8, 'published', 'public', false),

-- GYM (6)
(alison,   'GYM', '早晨重訓夥伴',               '2026-06-12 06:30+08', '2026-06-12 08:30+08', '大安運動中心健身房', '台北市大安區復興南路二段', 25.0265, 121.5437, 'any',          'mixed',  2,  6, 'published', 'public', true),
(chialin,  'GYM', '深蹲臥推挑戰',               '2026-06-19 19:00+08', '2026-06-19 21:00+08', '信義運動中心健身房', '台北市信義區莊敬路', 25.0354, 121.5705, 'intermediate', 'mixed',  2,  4, 'published', 'public', true),
(alison,   'GYM', '新手力量訓練',               '2026-06-26 18:00+08', '2026-06-26 20:00+08', '中正運動中心健身房', '台北市中正區愛國西路', 25.0345, 121.5178, 'beginner',     'mixed',  2,  6, 'published', 'public', true),
(chialin,  'GYM', '功能性訓練局',               '2026-07-03 07:00+08', '2026-07-03 09:00+08', '天母運動中心健身房', '台北市士林區中山北路七段', 25.1011, 121.5241, 'intermediate', 'mixed',  2,  4, 'published', 'public', true),
(alison,   'GYM', '女子重訓互助',               '2026-07-10 18:00+08', '2026-07-10 20:00+08', '大安運動中心健身房', '台北市大安區復興南路二段', 25.0265, 121.5437, 'any',          'female', 2,  4, 'published', 'public', true),
(chialin,  'GYM', '暑期體能提升局',             '2026-07-24 07:00+08', '2026-07-24 09:00+08', '信義運動中心健身房', '台北市信義區莊敬路', 25.0354, 121.5705, 'advanced',     'mixed',  2,  4, 'published', 'public', true),

-- YOGA (6)
(alison,   'YOGA', '戶外晨間瑜伽',              '2026-06-14 07:00+08', '2026-06-14 08:30+08', '大安森林公園草坪', '台北市大安區新生南路二段', 25.0295, 121.5353, 'any',          'mixed',  2, 20, 'published', 'public', true),
(chialin,  'YOGA', '恢復瑜伽',                  '2026-06-21 10:00+08', '2026-06-21 11:30+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'beginner',     'mixed',  2, 12, 'published', 'public', true),
(alison,   'YOGA', '陰瑜伽放鬆班',              '2026-06-28 19:00+08', '2026-06-28 20:30+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'any',          'female', 2, 10, 'published', 'public', true),
(chialin,  'YOGA', '河邊瑜伽聚',                '2026-07-05 07:00+08', '2026-07-05 08:30+08', '台北市河濱公園', '台北市中山區濱江街', 25.0746, 121.5399, 'any',          'mixed',  2, 20, 'published', 'public', true),
(alison,   'YOGA', '週末Vinyasa班',             '2026-07-12 10:00+08', '2026-07-12 11:30+08', '中正運動中心', '台北市中正區愛國西路', 25.0345, 121.5178, 'intermediate', 'mixed',  2, 12, 'published', 'public', true),
(chialin,  'YOGA', '暑假早鳥瑜伽',              '2026-07-26 07:00+08', '2026-07-26 08:30+08', '大安森林公園草坪', '台北市大安區新生南路二段', 25.0295, 121.5353, 'any',          'mixed',  2, 20, 'published', 'public', true),

-- PILATES (6)
(alison,   'PILATES', '皮拉提斯入門體驗',       '2026-06-13 10:00+08', '2026-06-13 11:30+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'beginner',     'mixed',  2, 10, 'published', 'public', true),
(chialin,  'PILATES', '墊上皮拉提斯',           '2026-06-22 11:00+08', '2026-06-22 12:30+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'any',          'female', 2,  8, 'published', 'public', true),
(alison,   'PILATES', '核心強化皮拉提斯',       '2026-06-30 19:00+08', '2026-06-30 20:30+08', '中正運動中心', '台北市中正區愛國西路', 25.0345, 121.5178, 'intermediate', 'mixed',  2,  8, 'published', 'public', true),
(chialin,  'PILATES', '週末皮拉提斯',           '2026-07-11 10:00+08', '2026-07-11 11:30+08', '信義運動中心', '台北市信義區莊敬路', 25.0354, 121.5705, 'any',          'mixed',  2, 10, 'published', 'public', true),
(alison,   'PILATES', '暑假女子班',             '2026-07-18 10:00+08', '2026-07-18 11:30+08', '天母運動中心', '台北市士林區中山北路七段', 25.1011, 121.5241, 'any',          'female', 2,  8, 'published', 'public', true),
(chialin,  'PILATES', '進階皮拉提斯體驗',       '2026-07-28 19:00+08', '2026-07-28 20:30+08', '大安運動中心', '台北市大安區復興南路二段', 25.0265, 121.5437, 'advanced',     'mixed',  2,  6, 'published', 'public', true),

-- SKATEBOARDING (6)
(alison,   'SKATEBOARDING', '滑板入門局',       '2026-06-13 15:00+08', '2026-06-13 17:00+08', '大安滑板場', '台北市大安區安和路', 25.0281, 121.5491, 'beginner',     'mixed',  2, 10, 'published', 'public', true),
(chialin,  'SKATEBOARDING', '街式技巧練習',     '2026-06-20 16:00+08', '2026-06-20 19:00+08', '大安滑板場', '台北市大安區安和路', 25.0281, 121.5491, 'intermediate', 'mixed',  2,  8, 'published', 'public', true),
(alison,   'SKATEBOARDING', '週末滑板聚',       '2026-06-27 14:00+08', '2026-06-27 17:00+08', '中山滑板廣場', '台北市中山區中山北路', 25.0600, 121.5240, 'any',          'mixed',  2, 10, 'published', 'public', true),
(chialin,  'SKATEBOARDING', '夜間滑板局',       '2026-07-06 19:00+08', '2026-07-06 22:00+08', '大安滑板場', '台北市大安區安和路', 25.0281, 121.5491, 'intermediate', 'mixed',  2,  8, 'published', 'public', true),
(alison,   'SKATEBOARDING', '女子滑板同樂日',   '2026-07-14 14:00+08', '2026-07-14 17:00+08', '中山滑板廣場', '台北市中山區中山北路', 25.0600, 121.5240, 'beginner',     'female', 2,  8, 'published', 'public', true),
(chialin,  'SKATEBOARDING', '暑假進階技巧班',   '2026-07-23 15:00+08', '2026-07-23 18:00+08', '大安滑板場', '台北市大安區安和路', 25.0281, 121.5491, 'advanced',     'mixed',  2,  6, 'published', 'public', true);

END $$;

RESET session_replication_role;

SELECT COUNT(*) AS total_seeded FROM sessions WHERE starts_at BETWEEN '2026-06-09' AND '2026-07-31 23:59:59';
