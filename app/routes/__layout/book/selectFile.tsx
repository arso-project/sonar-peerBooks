import type { ActionFunction } from '@remix-run/node'
import {
  json,
  LoaderFunction,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  writeAsyncIterableToWritable,
} from '@remix-run/node'
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react'

import { PassThrough } from 'stream'
import { validateFileId } from '~/lib/utils'
import { openCollection, uploadFileToSonar } from '../../../sonar.server'

import type { Files } from '@arsonar/client'

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
  const formErrors = { fileId: validateFileId(formData.get('file')) }
  if (formErrors.fileId) return formErrors

  const fileId = formData.get('file') as string
  return redirect(`/book/addmetadata?${fileId}`)
}

export const loader: LoaderFunction = async () => {
  const collection = await openCollection()
  const files = await collection.query('records', { type: 'sonar/file' })
  return json(files)
}

export default function SelectFile() {
  const actionData = useActionData()
  const files = useLoaderData()
  return (
    <div>
      {files.map((file: any, i: number) => {
        if (file.value.contentType === 'application/pdf') {
          return (
            <div key={i}>
              <a className='mr-2' href={'/book/addmetadata?fileId=' + file.id}>
                <div className='flex flex-row align-middle'>
                  <span className='mx-1 text-sm text-pink-600'>
                    {file.value.filename}
                  </span>
                </div>
              </a>
            </div>
          )
        }
      })}
      <Form method='post' encType='multipart/form-data'>
        {/* <label htmlFor='formFile'>File</label>
        <select id='formFile' name='fileId'>
          {files.map((file: any) => {
            return <option value={file.id}>{file.value.filename}</option>
          })}
        </select>
        {actionData?.formErrors?.fileId ? (
          <p style={{ color: 'red' }}>{actionData?.formErrors?.fileId}</p>
        ) : null} */}
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
