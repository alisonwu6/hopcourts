export type DictionaryItem = {
  key: string
  label: string
  subtitle?: string
  sort?: number
  is_active?: boolean
  icon?: string | null
}

export type Country = DictionaryItem

export type City = DictionaryItem & {
  country_key: string
}

export type Vibe = DictionaryItem

export type AgeRange = DictionaryItem

export type Sport = DictionaryItem & {
  category?: string
}
