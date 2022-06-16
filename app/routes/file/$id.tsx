import type { LoaderFunction } from '@remix-run/node'
import { openCollection } from '../../sonar.server'

export let loader: LoaderFunction = async ({ request, params }) => {
  const id = params.id
  if (typeof id !== 'string') return
  const collection = await openCollection()
  const requestHeaders = Object.fromEntries(request.headers.entries())
  const url = new URL(request.url)
  const query = url.search
  const meta = await collection.files.getFileMetadata(id)
  const res = await collection.files.readFile(id, {
    responseType: 'raw',
    headers: requestHeaders,
    params: query,
  })
  if (meta.value.filename) {
    res.headers.append(
      'Content-Disposition',
      `attachment; filename="${meta.value.filename}"`
    )
  }
  if (meta.value.contentType) {
    res.headers.set('content-type', meta.value.contentType)
  }
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  })
}
