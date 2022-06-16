import type { LoaderFunction } from '@remix-run/node'
import { useCatch, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { useParams } from 'react-router-dom'
import { openCollection } from '../../../sonar.server'

export let loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id
  console.log('ID: ', id)
  const collection = await openCollection()
  const records = await collection.get({ id })
  console.log('REcords loader', records)
  if (!records.length) {
    throw new Error('Book not found')
  }
  const record = records[0]
  return json(record)
}

export default function Page() {
  let record = useLoaderData()
  console.log('LOADED RECORD', record)

  return (
    <div data-p-page>
      <h1>{record.value.title}</h1>
      <span>ISBN: {record.value.isbn}</span>
      {record.value.numberOfPages && (
        <span> Number of Pages: {record.value.numberOfPages}</span>
      )}
      <p>{record.value.description}</p>
    </div>
  )
}

export function CatchBoundary() {
  let caught = useCatch()
  let params = useParams()
  switch (caught.status) {
    case 404: {
      return (
        <div className='error-container'>
          Huh? What the heck is {params.id}?
        </div>
      )
    }
    case 401: {
      return (
        <div className='error-container'>
          Sorry, but {params.id} is forbidden for you.
        </div>
      )
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`)
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  let { id } = useParams()
  return (
    <div>{`There was an error loading this Book by the id ${id}. Sorry.`}</div>
  )
}
