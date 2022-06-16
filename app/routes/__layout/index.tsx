import { ActionFunction, LoaderFunction, redirect } from '@remix-run/node'
import {
  json,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  writeAsyncIterableToWritable,
} from '@remix-run/node'
import {
  Link,
  useLoaderData,
  useActionData,
  Form,
  Outlet,
} from '@remix-run/react'
import { GrDocumentPdf } from 'react-icons/gr'
import { SiInternetarchive } from 'react-icons/si'

import { PassThrough } from 'stream'
import { validateFileId, validateISBN } from '~/lib/validator'
import fetchOpenLibraryData from '../../lib/openLibrary'
import {
  createBookRecord,
  openCollection,
  uploadFileToSonar,
} from '../../sonar.server'

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = unstable_composeUploadHandlers(
    async ({ name, contentType, data, filename }) => {
      if (name !== 'file') return null
      const uploadStream = new PassThrough()
      const [fileId] = await Promise.all([
        uploadFileToSonar({ data: uploadStream, contentType, filename }),
        writeAsyncIterableToWritable(data, uploadStream),
      ])
      if (fileId.error || typeof fileId !== 'string') return null
      return fileId
    },
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler)

  const { isbn, isbnErr } = validateISBN(formData.get('isbn'))
  const { fileId, fileIdErr } = validateFileId(formData.get('file'))
  const formErrors = {
    isbn: isbnErr,
    fileId: fileIdErr,
  }
  console.log('ISBN: ', isbn, 'fileId: ', fileId, fileIdErr)

  if (Object.values(formErrors).some(Boolean)) return { formErrors }

  let bookData

  try {
    bookData = await fetchOpenLibraryData(isbn)
    // console.log('BOOKDATA: ', bookData)
  } catch (err) {
    return json({
      error: { openlib: err },
    })
  }
  if (!bookData) return redirect('import?openLibrary=0')
  console.log('BOOKDATA_ACTION: ', bookData)
  const record = createBookRecord({
    title: bookData.title,
    isbn,
    authors: bookData.authors,
    url: bookData.url,
    identifiers: bookData.identifiers,
    publishers: bookData.publishers,
    cover: bookData.cover && bookData.cover.medium ? bookData.cover.medium : '',
    fileId,
  })

  return json('success')
}

export const loader: LoaderFunction = async () => {
  const collection = await openCollection()

  const books = await collection.query('records', {
    type: 'sonar-peerBooks/Book',
  })
  const files = await collection.query('records', { type: 'sonar/file' })
  return json({ books, files })
}

export default function Index() {
  const { books, files } = useLoaderData()
  const actionData = useActionData()
  console.log('#Records: ', books.length)
  console.log(files)
  console.log('ActionData: ', actionData)
  return (
    <div>
      <Form method='post' encType='multipart/form-data'>
        <label htmlFor='formISBN'>ISBN</label>
        <input type='text' name='isbn' id='formISBN' />
        {actionData?.formErrors?.isbn ? (
          <p style={{ color: 'red' }}>{actionData?.formErrors?.isbn}</p>
        ) : null}

        <label htmlFor='formFile'>File</label>
        <select id='formFile' name='fileId'>
          {files.map((file: any) => {
            return <option value={file.id}>{file.value.filename}</option>
          })}
        </select>
        {actionData?.formErrors?.fileId ? (
          <p style={{ color: 'red' }}>{actionData?.formErrors?.fileId}</p>
        ) : null}

        <label htmlFor='formFile'>File</label>
        <input type='file' id='formFile' name='file' accept='application/pdf' />
        {actionData?.formErrors?.file ? (
          <p style={{ color: 'red' }}>{actionData?.formErrors?.file}</p>
        ) : null}
        <button type='submit'>Submit</button>
      </Form>
    </div>
  )
}
