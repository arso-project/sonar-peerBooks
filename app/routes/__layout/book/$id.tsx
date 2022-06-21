import type { LoaderFunction } from '@remix-run/node'
import { useCatch, useLoaderData } from '@remix-run/react'
import { json } from '@remix-run/node'
import { useParams } from 'react-router-dom'
import { openCollection } from '../../../sonar.server'

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
  console.log('LOADED RECORD', record)

  return (
    <div data-p-page>
      <h1>{record.value.title}</h1>
      <span>id:{record.id}</span>
      {record.value.authors &&
        record.value.authors.map((author: Author, i: number) => {
          return (
            <p key={i} className='text-l text-slate-900'>
              {author}
            </p>
          )
        })}
      {record.value.publishers &&
        record.value.publishers.map((publisher: Publisher) => (
          <p className='text-l text-slate-900'>Publisher: {publisher}</p>
        ))}
      {record.value &&
        Object.entries(record.value).map((value) => {
          console.log(value[1], typeof value[1])
          if (typeof value[1] === 'string' && value[1] !== '') {
            return (
              <div>
                <span>{value[0] + ': '}</span>
                <span>{value[1]}</span>
              </div>
            )
          }
        })}
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
