import { json, LoaderFunction } from '@remix-run/node'
import {
  useLoaderData,
} from '@remix-run/react'
import { Book } from '~/components/book'

import { openCollection } from '../../sonar.server'

export const loader: LoaderFunction = async ({ request }) => {
  const collection = await openCollection()

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  // TODO: Write proper AND search query that filters for the book type.
  let records = await collection.query('search', q)
  records = records.filter(r => r.hasType('Book'))
  return json({ records, query: q })
}

export default function SearchPage() {
  const { records, query } = useLoaderData()
  let content
  if (!records.length) content = <div>Nothing found! Try another search?</div>
  else {
    content = (
      <div>
        {records.map((record: any, i: number) => {
          if (!record.value) {
            return <div>no data</div>
          }
          return <Book record={record} key={i} />
        })}
      </div>
    )
  }
  return (
    <div>
      <h1 className='text-3xl'>Search results for <em>{query}</em></h1>
      {content}
    </div>
  )
}
