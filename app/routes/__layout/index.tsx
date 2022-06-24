import { json, LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

import { openCollection } from '../../sonar.server'
import { schema } from '~/schema'
import { Book } from '~/components/book'
import type { Record } from '@arsonar/client'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const successId = url.searchParams.get('success')
  const collection = await openCollection()

  const unsortedBooks = await collection.query('records', {
    type: 'sonar-peerBooks/Book',
  })
  const files = await collection.query('records', { type: 'sonar/file' })
  const books = unsortedBooks.sort(function (x: Record, y: Record) {
    return parseInt(y.timestamp || '0') - parseInt(x.timestamp || '0')
  })
  return json({ books, successId })
}

export default function Layout() {
  const { books, successId } = useLoaderData()

  return (
    <div>
      {successId && (
        <div className='p-4 text-xl bg-green-500'>
          Success - New record with id {successId} created!
        </div>
      )}
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
