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
import { Form, useActionData, useLoaderData, Link } from '@remix-run/react'
import { GrDocumentPdf } from 'react-icons/gr'

import { PassThrough } from 'stream'
import { validateFileId } from '~/lib/utils'
import { openCollection, uploadFileToSonar } from '../../../sonar.server'
import { StepDisplay } from '~/components/stepDisplay'

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
  return redirect(`/book/addmetadata?fileId=${fileId}`)
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
      <StepDisplay step={1} />
      <div className='p-4 my-4'>
        <label
          className='block mb-2 text-sm font-medium text-gray-900'
          htmlFor='formFile'
        >
          Select a file:
        </label>
        <div className='grid grid-cols-6 '>
          {files.map((file: any, i: number) => {
            if (file.value.contentType === 'application/pdf') {
              return (
                <div key={i} className='mx-4'>
                  <a
                    className='mr-2'
                    href={'/book/addmetadata?fileId=' + file.id}
                  >
                    <GrDocumentPdf className='text-7xl ' />

                    <span className='text-sm text-pink-600'>
                      {file.value.filename.length > 15
                        ? file.value.filename.substring(0, 10) +
                          '...' +
                          file.value.filename.substring(
                            file.value.filename.length - 6
                          )
                        : file.value.filename}
                    </span>
                  </a>
                </div>
              )
            }
          })}
        </div>
        <div className='my-4'>
          <Form method='post' encType='multipart/form-data'>
            <label
              className='block mb-2 text-sm font-medium text-gray-900'
              htmlFor='formFile'
            >
              Import new File:
            </label>
            <input
              type='file'
              id='formFile'
              name='file'
              accept='application/pdf'
            />
            {actionData?.formErrors?.file ? (
              <p style={{ color: 'red' }}>{actionData?.formErrors?.file}</p>
            ) : null}
            <button type='submit'>Submit</button>
          </Form>
        </div>
      </div>
    </div>
  )
}
