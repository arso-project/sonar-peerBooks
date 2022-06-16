import { fieldNameFromStoreName } from '@apollo/client/cache'
import { isbn as checkISBN } from 'simple-isbn'

export function validateISBN(isbn: FormDataEntryValue | null) {
  if (typeof isbn !== 'string' || isbn.length == 0) {
    return { isbnErr: 'isbn is required' }
  } else if (!checkISBN.isValidIsbn(isbn)) {
    return { isbnErr: 'invalid isbn' }
  }
  return { isbn }
}

export function validateFileId(fileId: FormDataEntryValue | null) {
  // console.log('Validation FileId', fileId)
  if (typeof fileId !== 'string') {
    return { fileIdErr: 'Something is going wrong with your upload' }
  }
  return { fileId }
}
