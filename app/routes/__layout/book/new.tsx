import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from '@remix-run/react'

import { validateFileId, validateISBN } from '~/lib/validator'
import fetchOpenLibraryData from '../../../lib/openLibrary'
import { createBookRecord, openCollection } from '../../../sonar.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const formErrors = {
    isbn: validateISBN(formData.get('isbn')),
  }
  if (Object.values(formErrors).some(Boolean)) return { formErrors }
  const isbn = formData.get('isbn') as string

  let bookData

  try {
    bookData = await fetchOpenLibraryData(isbn as string)
  } catch (err) {
    return json({
      error: { openlib: err },
    })
  }
  if (!bookData) return redirect('import?openLibrary=0')
  // const record = createBookRecord({
  //   title: bookData.title,
  //   isbn,
  //   authors: bookData.authors,
  //   url: bookData.url,
  //   identifiers: bookData.identifiers,
  //   publishers: bookData.publishers,
  //   cover: bookData.cover && bookData.cover.medium ? bookData.cover.medium : '',
  //   fileId,
  // })
  return json({ bookData })
}

export const loader: LoaderFunction = async ({ request }) => {
  const collection = await openCollection()
  const url = new URL(request.url)
  const fileId = url.searchParams.get('fileId')
  if (typeof fileId !== 'string') return { meta: undefined, fileId: undefined }
  const meta = await collection.files.getFileMetadata(fileId)
  return { meta, fileId }
}

export default function Index() {
  const { meta, fileId } = useLoaderData()
  console.log('BOOKNEW:', fileId, meta)
  const actionData = useActionData()
  console.log('ACTIONDATA:', actionData)
  const bookData = actionData?.bookData
  console.log('BOOKDATA: ', bookData)
  const location = useLocation()
  if (!fileId && !bookData) {
    return (
      <div>
        Please first
        <a className='mr-2' href={'selectfile'}>
          <span className='mx-1 text-sm text-pink-600'> select a file </span>
        </a>
        for this Bookrecord{' '}
      </div>
    )
  }

  console.log('BOOKDATA:', bookData, 'ACTIONDATA: ', actionData)
  return (
    <div>
      <p>
        Load the metadata for file {meta.value.filename} using the ISBN from
        OpenLibrary or fill in the form <a href=''>manually</a>.
      </p>
      {!bookData ? (
        <Form action={`${location.pathname}${location.search}`} method='post'>
          <label htmlFor='formISBN'>ISBN</label>
          <input type='text' name='isbn' id='formISBN' />
          {actionData?.formErrors?.isbn ? (
            <p style={{ color: 'red' }}>{actionData?.formErrors?.isbn}</p>
          ) : null}
          <button type='submit'>Submit</button>
        </Form>
      ) : (
        <div> Hello</div>
      )}
    </div>
  )
}
