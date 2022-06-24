export default async function fetchOpenLibraryData(isbn: string) {
  const identifier = 'ISBN:' + isbn
  const url =
    'https://openlibrary.org/api/books?bibkeys=' +
    identifier +
    '&jscmd=data&format=json'
  const res = await fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error('ERROR' + res.status)
      }
      return res.json()
    })
    .then((data) => {
      return data[identifier]
    })
    .catch((error) => {
      return error
    })
  return res
}

interface OpenlibraryData {
  title?: string
  subtitle?: string
  identifiers?: any
  number_of_pages?: string
  excerpts?: any
  publishers?: Array<{ name: string; url: string }>
  publish_date?: string
  url?: string
  genre?: Array<{ name: string; url: string }>
  authors?: Array<{ name: string; url: string }>
  description?: string
  cover?: { small?: string; medium?: string; large?: string }
}

export function mapOpenlibraryData(openlibraryData: OpenlibraryData) {
  return {
    title: openlibraryData?.title || '',
    subtitle: openlibraryData?.subtitle || '',
    isbn_10: String(openlibraryData?.identifiers?.isbn_10 || ''),
    isbn_13: String(openlibraryData?.identifiers?.isbn_13 || ''),
    number_of_pages: openlibraryData?.number_of_pages || '',
    excerpts: String(
      openlibraryData?.excerpts?.map(
        (excerpts: { text: string; comment: string }) => excerpts.text
      ) || ''
    ),
    openlibraryId: String(openlibraryData?.identifiers?.openlibrary),
    publishers: String(
      openlibraryData?.publishers?.map(
        (publisher: { name: string; url: string }) => publisher.name
      )
    ),
    publish_date: openlibraryData?.publish_date || '',
    openlibraryUrl: openlibraryData?.url,
    genre: String(
      openlibraryData?.genre?.map(
        (genre: { name: string; url: string }) => genre.name
      ) || ''
    ),
    authors: String(
      openlibraryData?.authors?.map(
        (authors: { name: string; url: string }) => authors.name
      )
    ),
    description: openlibraryData?.description || '',

    coverImageUrl:
      openlibraryData?.cover?.medium || openlibraryData?.cover?.small || '',
  }
}
