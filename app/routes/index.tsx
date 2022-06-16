import type { LoaderFunction } from '@remix-run/node'
import { openCollection } from '~/sonar.server'
import { json } from '@remix-run/node'
import { useLoaderData, Form, Link } from '@remix-run/react'
import { Record } from '@arsonar/client'
import { GrDocumentPdf } from 'react-icons/gr'
import { SiInternetarchive } from 'react-icons/si'

interface Publisher {
  url: string
  name: string
}

interface Author {
  url: string
  name: string
}

export const loader: LoaderFunction = async () => {
  const collection = await openCollection()
  const books = await collection.query('records', {
    type: 'sonar-peerBooks/Book',
  })
  // console.log('Books: ', books)

  return json(books)
}

export default function Index() {
  const records = useLoaderData()
  return (
    <div>
      <h1>PeerBooks</h1>
      <Form method='post' action='import' encType='multipart/form-data'>
        <label htmlFor='formISBN'>ISBN</label>
        <input type='text' name='isbn' id='formISBN' />

        <label htmlFor='formFile'>File</label>
        <input type='file' id='formFile' name='file' accept='application/pdf' />

        <button type='submit'>Submit</button>
      </Form>

      {records.map((record: any, i: number) => {
        if (!record.value) {
          return <div>no data</div>
        }

        const title =
          record.value.title || 'No Title - ISBN: ' + record.value.isbn
        return (
          <div key={i}>
            <div className='flex py-4'>
              <div className='pr-2'>
                <img src={record.value.coverImageUrl}></img>
              </div>
              <div>
                <Link to={'/page/' + record.id}>
                  <h2 className='text-xl text-slate-900'>{title}</h2>
                </Link>
                {record.value.authors &&
                  record.value.authors.map((author: Author) => (
                    <a href={author.url}>
                      <p className='text-l text-slate-900'>
                        Author: {author.name}
                      </p>
                    </a>
                  ))}
                {record.value.publishers &&
                  record.value.publishers.map((publisher: Publisher) => (
                    <p className='text-l text-slate-900'>
                      Publisher: {publisher.name}
                    </p>
                  ))}

                {record.value.isbn && (
                  <p className='text-l text-slate-900'>
                    ISBN: {record.value.isbn}
                  </p>
                )}
                {record.value.numberOfPages && (
                  <p> Number of Pages: {record.value.numberOfPages}</p>
                )}
                {record.value.description && <p>{record.value.description}</p>}

                <div className='flex'>
                  {' '}
                  {record.value.file && (
                    <a className='mr-2' href={'/file/' + record.value.file}>
                      <div className='flex flex-row align-middle'>
                        <GrDocumentPdf />
                        <span className='mx-1 text-sm text-pink-600'>
                          Download
                        </span>
                      </div>
                    </a>
                  )}
                  {record.value.openLibraryUrl && (
                    <a href={record.value.openLibraryUrl}>
                      <div className='flex flex-row align-middle'>
                        <SiInternetarchive />
                        <span className='mx-1 text-sm text-pink-600'>
                          OpenLibrary
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
