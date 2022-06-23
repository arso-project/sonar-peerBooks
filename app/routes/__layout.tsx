import { json, LoaderFunction } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useCatch,
  Form,
} from '@remix-run/react'
import { GrDocumentPdf } from 'react-icons/gr'
import { SiInternetarchive } from 'react-icons/si'

import { openCollection } from '../sonar.server'

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
  return (
    <div>
      <div className='p-2 bg-blue-600 flex-1 flex items-end justify-end sm:items-stretch sm:justify-start'>
        <div className='flex-shrink-0 flex  items-end'>
          <Link to='/'>
            <h1 className='text-2xl text-white hover:text-pink-600'>
              PeerBooks
            </h1>
          </Link>

          <Link
            className='ml-10 text-white hover:text-pink-600'
            to='/book/selectfile'
          >
            + import new book
          </Link>
          <Form action='/search' method='get'>
            <input type='text' name='q' placeholder='Search...' />
            <button type='submit'>Go!</button>
          </Form>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
