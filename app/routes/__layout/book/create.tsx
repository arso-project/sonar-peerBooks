import { ActionFunction, json, LoaderFunction, redirect } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useLocation,
} from '@remix-run/react'

import {
  parseArrayField,
  validateFileId,
  validateISBN,
  validateStringField,
} from '~/lib/utils'
import fetchOpenLibraryData from '../../../lib/openLibrary'
import { createBookRecord, openCollection } from '../../../sonar.server'
import { schema } from '~/schema'
import { SiJameson } from 'react-icons/si'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const fields = Object.entries(schema.types.Book.fields)
  const data = fields.map((field) => formData.get(field[0]) as string)

  const formErrors: any = {}
  const obj: any = {}
  fields.forEach((field, i) => {
    formErrors[field[0]] = validateStringField(data[i])
    if (field[1]?.type === 'array') {
      obj[field[0]] = parseArrayField(data[i])
    } else {
      obj[field[0]] = data[i]
    }
  })

  if (Object.values(formErrors).some(Boolean)) return { formErrors }
  const record = await createBookRecord(obj)
  return redirect('/?success=' + record.id)
}

export const loader: LoaderFunction = async () => {
  return redirect('/')
}
