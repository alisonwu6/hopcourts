import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { Language, TranslationSchema, getTranslation } from './translations'

const STORAGE_KEY = 'sportsmatch-language'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  copy: TranslationSchema
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

type Props = {
  children: ReactNode
}

export function LanguageProvider({ children }: Props) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null
    return stored === 'zh-TW' ? 'zh-TW' : 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, language)
    }
  }, [language])

  const value = useMemo((): LanguageContextValue => {
    const copy = getTranslation(language)
    const handleSetLanguage = (value: Language) => setLanguage(value)
    return {
      language,
      setLanguage: handleSetLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === 'en' ? 'zh-TW' : 'en')),
      copy,
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    toggleLanguage: context.toggleLanguage,
  }
}

export function useCopy() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useCopy must be used within a LanguageProvider')
  }
  return context.copy
}
