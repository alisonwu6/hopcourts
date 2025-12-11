export type SportOption = {
  id: string
  label: string
  isStarter?: boolean
}

export const sportOptions: SportOption[] = [
  { id: 'basketball', label: '籃球' },
  { id: 'running', label: '跑步' },
  { id: 'fitness', label: '健身' },
  { id: 'badminton', label: '羽球' },
  { id: 'pickleball', label: '匹克球' },
  { id: 'football', label: '足球' },
  { id: 'pilates', label: '皮拉提斯' },
  { id: 'yoga', label: '瑜伽' },
  { id: 'tennis', label: '網球' },
  { id: 'swimming', label: '游泳' },
  { id: 'cycling', label: '單車' },
  { id: 'boxing', label: '拳擊' },
  { id: 'climbing', label: '攀岩' },
  { id: 'bouldering', label: '抱石' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'table-tennis', label: '桌球' },
  { id: 'volleyball', label: '排球' },
  { id: 'beach-volleyball', label: '沙灘排球' },
  { id: 'hiking', label: '健行' },
  { id: 'trail-running', label: '越野跑' },
  { id: 'rowing', label: '划船' },
  { id: 'surfing', label: '衝浪' },
  { id: 'skateboarding', label: '滑板' },
  { id: 'padel', label: '板網球' },
  { id: 'rugby', label: '橄欖球' },
  { id: 'cricket', label: '板球' },
  { id: 'ultimate', label: '極限飛盤' },
  { id: 'dodgeball', label: '躲避球' },
] as const
