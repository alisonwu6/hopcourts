export function getFlagEmoji(countryCode?: string | null) {
  if (!countryCode || countryCode.length !== 2) return ''
  return countryCode
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}
