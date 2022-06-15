import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import {
  json,
  redirect,
  unstable_parseMultipartFormData,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
} from '@remix-run/node'
import { Form } from '@remix-run/react'
import { openCollection, createBookRecord } from '../sonar.server'
import fetchOpenLibraryData from '../lib/openLibrary'
import { isbn as checkISBN } from 'simple-isbn'

interface uploadFileToSonarProps {
  name: string | undefined
  contentType: string
  data: AsyncIterable<Uint8Array>
  filename: string | undefined
}

async function uploadFileToSonar({
  name,
  contentType,
  data,
  filename,
}: uploadFileToSonarProps) {
  const collection = await openCollection()
  let fileRecord
  try {
    fileRecord = await collection.files.createFile(data, {
      filename,
      contentType,
      name,
    })
  } catch (err: any) {
    console.log(err)
    return err
  }
  return fileRecord.id
}

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== 'file') return null
      const fileId = uploadFileToSonar({ name, contentType, filename, data })
      return fileId
    },
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const isbn = formData.get('isbn')
  const fileId = formData.get('file')

  if (
    typeof isbn !== 'string' ||
    (!checkISBN.isValidIsbn(isbn) && fileId !== 'string')
  ) {
    return json({
      error: {
        isbn: 'ISBN has to be a valid isbn-string',
        file: 'Something was wrong with your uploaded file',
      },
    })
  }
  if (typeof isbn !== 'string' || !checkISBN.isValidIsbn(isbn)) {
    return json({
      error: { isbn: 'ISBN has to be a valid isbn-string' },
    })
  }
  if (typeof fileId !== 'string')
    return json({
      error: { file: 'Something was wrong with your uploaded file' },
    })

  let bookData

  try {
    bookData = await fetchOpenLibraryData(isbn)
    console.log('BOOKDATA: ', bookData)
  } catch (err) {
    return json({
      error: { openlib: err },
    })
  }
  if (!bookData) return redirect('/import')
  const record = createBookRecord({
    title: bookData.title,
    isbn,
    authors: bookData.authors,
    url: bookData.url,
    identifiers: bookData.identifiers,
    publishers: bookData.publishers,
    cover: bookData.cover,
    fileId,
  })

  console.log('ISBN: ', isbn, 'fileId: ', fileId)
  return json('success')
}

export default function Index() {
  return (
    <div>
      <h1>PeerBooks</h1>
      <Form method='post' action='import' encType='multipart/form-data'>
        <label htmlFor='formISBN'>ISBN</label>
        <input type='text' name='isbn' id='formISBN' />

        <label htmlFor='formFile'>File</label>
        <input type='file' id='formFile' name='file' accept='application/pdf' />

        <button type='submit'>Submit</button>
      </Form>
    </div>
  )
}
