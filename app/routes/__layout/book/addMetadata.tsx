import { ActionFunction, json, LoaderFunction } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
  useFetcher,
} from '@remix-run/react'

import { validateISBN } from '~/lib/utils'
import { schema } from '~/schema'
import fetchOpenLibraryData, {
  mapOpenlibraryData,
} from '../../../lib/openLibrary'
import { openCollection } from '../../../sonar.server'

import { StepDisplay } from '~/components/stepDisplay'
import { FullForm, FormField } from '~/components/form'
import { Link } from '@remix-run/react'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const formErrors = {
    isbn: validateISBN(formData.get('isbn')),
  }
  if (Object.values(formErrors).some(Boolean)) return { formErrors }
  const isbn = formData.get('isbn') as string

  let openlibraryData

  try {
    openlibraryData = await fetchOpenLibraryData(isbn as string)
  } catch (err) {
    return json({
      error: { openlib: err },
    })
  }

  const bookData = openlibraryData
    ? mapOpenlibraryData(openlibraryData)
    : undefined
  if (!bookData) return json({ noOpenlibraryData: true })
  return json({ bookData })
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const collection = await openCollection()
  const url = new URL(request.url)
  const fileId = url.searchParams.get('fileId')
  const manual =
    parseInt(url.searchParams.get('manual') || '0') === 1 ? true : false
  if (typeof fileId !== 'string') return { meta: undefined, fileId: undefined }
  const meta = await collection.files.getFileMetadata(fileId)
  return { meta, fileId, manual }
}

export default function Index() {
  const { meta, fileId, manual } = useLoaderData()
  const actionData = useActionData()
  const bookData = actionData?.bookData
  const noOpenlibraryData = actionData?.noOpenlibraryData
  const location = useLocation()
  // if no file selected return a link to File selection
  if (!fileId) {
    return (
      <div>
        <StepDisplay step={2} />
        <MissingFileIdMessage />
      </div>
    )
  }
  return (
    <div>
      {/* Fetch data from OpenLibrary */}
      {!bookData && !manual && !noOpenlibraryData && (
        <div>
          <StepDisplay step={2} />
          <div className='p-2'>
            <p>
              Load the metadata for file {meta.value.filename} using the ISBN
              from OpenLibrary or fill in the form{' '}
              <a href={location.pathname + location.search + '&manual=1'}>
                manually
              </a>
              .
            </p>
            <Form
              action={`${location.pathname}${location.search}`}
              method='post'
            >
              <FormField
                name='isbn'
                type='text'
                formErrors={actionData?.formErrors}
              />
              <button className='m-2 button' type='submit'>
                Submit
              </button>
            </Form>
          </div>
        </div>
      )}
      {/* Create Record with data from OpenLibrary or add Data manually */}
      {(bookData || manual || noOpenlibraryData) && (
        <div>
          <StepDisplay step={3} />
          <div className='p-4'>
            <FullForm
              fileId={fileId}
              bookData={bookData}
              formErrors={actionData?.formErrors}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MissingFileIdMessage() {
  return (
    <div className='p-2'>
      Please first
      <Link className='mr-2' to={'selectfile'}>
        <span className='mx-1 text-sm text-pink-600'> select a file </span>
      </Link>
    </div>
  )
}
