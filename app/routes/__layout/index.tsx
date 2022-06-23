import { json, LoaderFunction } from '@remix-run/node'
import {
  useLoaderData,
} from '@remix-run/react'

import { openCollection } from '../../sonar.server'
import { schema } from '~/schema'
import { Book } from '~/components/book'

export const loader: LoaderFunction = async () => {
  const collection = await openCollection()

  const books = await collection.query('records', {
    type: 'sonar-peerBooks/Book',
  })
  const files = await collection.query('records', { type: 'sonar/file' })
  return json(books)
}

export default function Layout() {
  const books = useLoaderData()
  const fields = Object.entries(schema.types.Book.fields)

  return (
    <div>
      <div>
        {books.map((record: any, i: number) => {
          if (!record.value) {
            return <div>no data</div>
          }
          return <Book record={record} key={i} />
        })}
      </div>
    </div>
  )
}
