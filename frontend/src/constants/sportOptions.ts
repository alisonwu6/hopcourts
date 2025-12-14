export type SportOption = {
  id: string
  label: string
  isStarter?: boolean
  category?: string
  i18nKey?: string
}

export const sportOptions: SportOption[] = [
  // { id: 'none', label: '暫無，因為上次運動不知道什麼時候了！' },
  // { id: 'starter', label: '我剛開始運動', isStarter: true },
  // A. 社交與競技
  { id: 'basketball', label: '籃球', category: 'social_competitive', i18nKey: 'sports.basketball' },
  { id: 'badminton', label: '羽球', category: 'social_competitive', i18nKey: 'sports.badminton' },
  { id: 'table-tennis', label: '桌球', category: 'social_competitive', i18nKey: 'sports.table_tennis' },
  { id: 'volleyball', label: '排球', category: 'social_competitive', i18nKey: 'sports.volleyball' },
  { id: 'tennis', label: '網球', category: 'social_competitive', i18nKey: 'sports.tennis' },
  { id: 'pickleball', label: '匹克球', category: 'social_competitive', i18nKey: 'sports.pickleball' },
  { id: 'football', label: '足球', category: 'social_competitive', i18nKey: 'sports.football' },
  { id: 'baseball-softball', label: '棒壘球', category: 'social_competitive', i18nKey: 'sports.baseball_softball' },
  // B. 探險與耐力
  { id: 'running', label: '慢跑', category: 'adventure_endurance', i18nKey: 'sports.running' },
  { id: 'cycling', label: '自行車', category: 'adventure_endurance', i18nKey: 'sports.cycling' },
  { id: 'hiking', label: '登山健行', category: 'adventure_endurance', i18nKey: 'sports.hiking' },
  { id: 'bouldering', label: '抱石', category: 'adventure_endurance', i18nKey: 'sports.bouldering' },
  { id: 'climbing', label: '戶外攀岩', category: 'adventure_endurance', i18nKey: 'sports.climbing' },
  { id: 'surfing', label: '衝浪', category: 'adventure_endurance', i18nKey: 'sports.surfing' },
  { id: 'diving', label: '潛水', category: 'adventure_endurance', i18nKey: 'sports.diving' },
  // C. 專業訓練與健身
  { id: 'gym', label: '重訓', category: 'training_fitness', i18nKey: 'sports.gym' },
  { id: 'yoga', label: '瑜珈', category: 'training_fitness', i18nKey: 'sports.yoga' },
  { id: 'pilates', label: '皮拉提斯', category: 'training_fitness', i18nKey: 'sports.pilates' },
  { id: 'hiit', label: 'HIIT', category: 'training_fitness', i18nKey: 'sports.hiit' },
  { id: 'boxing', label: '拳擊', category: 'training_fitness', i18nKey: 'sports.boxing' },
  { id: 'martial-arts', label: '格鬥', category: 'training_fitness', i18nKey: 'sports.martial_arts' },
  // D. 節奏與表達
  { id: 'pop-dance', label: '流行舞', category: 'rhythm_expression', i18nKey: 'sports.pop_dance' },
  { id: 'street-dance', label: '街舞', category: 'rhythm_expression', i18nKey: 'sports.street_dance' },
  { id: 'skateboard', label: '滑板', category: 'rhythm_expression', i18nKey: 'sports.skateboard' },
] as const
