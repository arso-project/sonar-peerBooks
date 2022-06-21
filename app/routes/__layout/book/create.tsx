import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from '@remix-run/react'

import { validateFileId, validateISBN } from '~/lib/utils'
import fetchOpenLibraryData from '../../../lib/openLibrary'
import { createBookRecord, openCollection } from '../../../sonar.server'
import { schema } from '~/schema'
import { SiJameson } from 'react-icons/si'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()

  const formErrors = {
    isbn: validateISBN(formData.get('isbn')),
  }
  if (Object.values(formErrors).some(Boolean)) return { formErrors }
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
  return json('success')
}

export const loader: LoaderFunction = async () => {
  return redirect('/')
}
