export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png']

function stripControlCharacters(value) {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127)
    })
    .join('')
}

export function cleanText(value, maxLength = 1000) {
  return stripControlCharacters(value)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function validateImageFile(file) {
  if (!file) {
    return ''
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPG and PNG images are allowed.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image must be 5MB or smaller.'
  }
  return ''
}
