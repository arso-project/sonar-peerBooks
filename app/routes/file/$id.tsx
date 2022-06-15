import type { LoaderFunction } from '@remix-run/node'
import { openCollection } from '../../sonar.server'

export let loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id
  if (typeof id !== 'string') return
  const collection = await openCollection()
  const requestHeaders = Object.fromEntries(request.headers.entries())
  const url = new URL(request.url)
  const query = url.search
  const res = await collection.files.readFile(id, {
    responseType: 'raw',
    headers: requestHeaders,
    query: query,
  })
  console.log(res)
  return new Response(res.body, {
    status: res.status,
    // TODO: Change to public entries() API once sonar client moves to WebApi fetch
    headers: res.headers,
  })
}
