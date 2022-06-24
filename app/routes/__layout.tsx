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
      <div className='p-2 bg-pink-600 flex-1 flex md:flex-row md:justify-between justify-start flex-col w-full'>
        <div className='flex items-end'>
          <Link to='/'>
            <h1 className='text-2xl text-white hover:text-slate-900'>
              PeerBooks
            </h1>
          </Link>

          <Link
            className='ml-10 text-white hover:text-slate-900'
            to='/book/selectfile'
          >
            import new book
          </Link>

          <Link className='ml-10 text-white hover:text-slate-900' to='/feeds'>
            manage collection
          </Link>
        </div>
        <div>
          <Form action='/search' method='get'>
            <input type='text' name='q' placeholder='Search...' />
            <button
              className='bg-slate-900 text-white border-transparent hover:text-slate-900 hover:bg-white'
              type='submit'
            >
              Go!
            </button>
          </Form>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
