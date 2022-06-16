import { json, LoaderFunction } from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useCatch,
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
      <h1>PeerBooks</h1>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
