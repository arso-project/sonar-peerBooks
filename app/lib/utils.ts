import { isbn as checkISBN } from 'simple-isbn'

export function validateISBN(isbn: FormDataEntryValue | null) {
  if (typeof isbn !== 'string' || isbn.length == 0) {
    return 'isbn is required'
  } else if (!checkISBN.isValidIsbn(isbn)) {
    return 'invalid isbn'
  }
}

export function validateFileId(fileId: FormDataEntryValue | null) {
  if (typeof fileId !== 'string') {
    return 'Something is going wrong with your upload'
  }
}

export function validateStringField(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') {
    return 'field only accepts string inputs'
  }
}

export function parseArrayField(value: string) {
  return value.split(',')
}
