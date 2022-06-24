import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'

import { openCollection } from '~/sonar.server'
import prettyBytes from 'readable-bytes'

export const loader: LoaderFunction = async (): Promise<Response> => {
  // const session = await getSessionFromRequest(request)
  const collection: any = await openCollection()
  return json({ collection: collection.info })
}

export const action: ActionFunction = async ({
  request,
}): Promise<Response> => {
  const collection = await openCollection()
  const form = await request.formData()
  const key = form.get('key') as string
  if (key) {
    await collection.putFeed(key)
  }
  return json({})
}

export default function FeedsPage() {
  const data = useLoaderData()
  console.log(data)
  const feeds = data.collection.feeds
  return (
    <div className='p-4'>
      <h2>Manage collection</h2>
      <div className='p-2'>
        Collection primary key:
        <br />
        <code>{data.collection.key}</code>
      </div>
      <hr className='my-4' />
      <h3>Feeds</h3>
      <div className='p-2'>
        {feeds.map((feed: any) => (
          <Feed feed={feed} key={feed.key} />
        ))}
      </div>
      <div className='my-4'>
        <h4>Add new feeds:</h4>
        <Form method='post'>
          <input name='key' placeholder='Paste key...' />
          <button type='submit'>submit</button>
        </Form>
      </div>
    </div>
  )
}

function Feed({ feed }: { feed: any }) {
  return (
    <div className='my-2'>
      <h3 className='border-solid border-pink-600 border-b-2'>
        {feed.alias && <div>Alias: {feed.alias}</div>} Key: {feed.key}
      </h3>
      <div>
        <span className='text-slate-400'>Writable :</span>
        <strong>{feed.writable ? 'Yes' : 'No'}</strong>
        &nbsp;
        <span className='text-slate-400'>Type: </span> {feed.type}
      </div>
      <div>
        <span className='text-slate-400'>Size: </span>
        <strong>{prettyBytes(feed.byteLength)}</strong> ({feed.length} blocks)
      </div>
    </div>
  )
}
