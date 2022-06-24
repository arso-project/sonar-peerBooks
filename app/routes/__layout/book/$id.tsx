import type { LoaderFunction } from '@remix-run/node'
import { useCatch, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { useParams } from 'react-router-dom'
import { openCollection } from '../../../sonar.server'
import { Book } from '~/components/book'

export let loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id
  const collection = await openCollection()
  const records = await collection.get({ id })
  if (!records.length) {
    throw new Error('Book not found')
  }
  const record = records[0]
  return json(record)
}

export default function Page() {
  let record = useLoaderData()

  return (
    <div data-p-page>
      <Book record={record} />
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
