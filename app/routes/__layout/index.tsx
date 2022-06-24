import { json, LoaderFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

import type { Record } from '@arsonar/client'
import { Book } from '~/components/book'
import { openCollection } from '../../sonar.server'

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const successId = url.searchParams.get('success')
  const collection = await openCollection()

  const unsortedBooks = await collection.query('records', {
    type: 'sonar-peerBooks/Book',
  })
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
        <div className='p-4 text-xl flex justify-between bg-slate-800 text-white'>
          <span>
            Success - New record with id{' '}
            <Link to={'/book/' + successId}>{successId}</Link> created!
          </span>
          <Link to='/'>X</Link>
        </div>
      )}
      <div className='my-8 p-4'>
        <h2>Books</h2>
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
