export default async function fetchOpenLibraryData(isbn: string) {
  const identifier = 'ISBN:' + isbn
  const url =
    'https://openlibrary.org/api/books?bibkeys=' +
    identifier +
    '&jscmd=data&format=json'
  console.log('OPENLIBURL: ', url)
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
      console.log('Error: ', error)
      return error
    })
  console.log('RESULT FETCHOPENLIB: ', res)
  return res
}
