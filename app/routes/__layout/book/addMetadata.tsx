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
import fetchOpenLibraryData from '../../../lib/openLibrary'
import { openCollection } from '../../../sonar.server'

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
    ? {
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
        openlibraryId: String(openlibraryData?.identifiers?.openlibrary || ''),
        publishers: String(
          openlibraryData?.publishers?.map(
            (publisher: { name: string; url: string }) => publisher.name
          ) || ''
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
          ) || ''
        ),
        description: openlibraryData?.description || '',

        coverImageUrl:
          openlibraryData?.cover?.medium || openlibraryData?.cover?.small || '',
      }
    : undefined

  if (!bookData) return json('NO DATA')
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
  const location = useLocation()
  // if no file selected return a link to File selection
  if (!fileId) {
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

  return (
    <div>
      {!bookData && !manual && (
        <div>
          <p>
            Load the metadata for file {meta.value.filename} using the ISBN from
            OpenLibrary or fill in the form{' '}
            <a href={location.pathname + location.search + '&manual=1'}>
              manually
            </a>
            .
          </p>
          <Form action={`${location.pathname}${location.search}`} method='post'>
            <label htmlFor='formISBN'>ISBN</label>
            <input type='text' name='isbn' id='formISBN' />
            {actionData?.formErrors?.isbn ? (
              <p style={{ color: 'red' }}>{actionData?.formErrors?.isbn}</p>
            ) : null}
            <button type='submit'>Submit</button>
          </Form>
        </div>
      )}
      {(bookData || manual) && (
        <FullForm
          fileId={fileId}
          bookData={bookData}
          formErrors={actionData?.formErrors}
        />
      )}
    </div>
  )
}

interface FormErrors {
  [key: string]: any
}

interface FormFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  formErrors: FormErrors
}

function FormField({ name, type, defaultValue, formErrors }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <input type={type} name={name} id={name} defaultValue={defaultValue} />
      {formErrors?.get(name) ? (
        <p style={{ color: 'red' }}>{formErrors?.get(name)}</p>
      ) : null}
    </div>
  )
}

interface FullFormProps {
  bookData: any //ToDo: BookData
  formErrors: FormErrors
  fileId: string
}
function FullForm({ fileId, bookData, formErrors }: FullFormProps) {
  const fetcher = useFetcher()
  const fields = Object.keys(schema.types.Book.fields)
  return (
    <fetcher.Form action='/book/create' method='post'>
      {fields.map((field, i) => {
        if (field === 'file')
          return <input type={'hidden'} name={field} id='name' value={fileId} />
        return (
          <FormField
            key={i}
            name={field}
            defaultValue={bookData?.[field] || ''}
            formErrors={formErrors}
            type='text'
          />
        )
      })}

      <button type='submit'>Create Book Record</button>
    </fetcher.Form>
  )
}
