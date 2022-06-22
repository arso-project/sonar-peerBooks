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

import { openCollection } from '../../sonar.server'
import { schema } from '~/schema'

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
  const fields = Object.entries(schema.types.Book.fields)

  return (
    <div>
      <div>
        {books.map((record: any, i: number) => {
          if (!record.value) {
            return <div>no data</div>
          }
          return (
            <div key={i} className='p-2'>
              <div className='flex'>
                <div className='pr-2 mr-5 w-1/4 justify-center'>
                  <img
                    className='object-cover w-60'
                    src={
                      record.value.coverImageUrl !== '' || undefined
                        ? record.value.coverImageUrl
                        : '/placeholder.png'
                    }
                  ></img>
                </div>
                <div>
                  <Link to={'/book/' + record.id}>
                    <h2 className='text-xl text-pink-600'>
                      {record.value.title}
                    </h2>
                  </Link>
                  <h2 className='text-lg text-pink-600'>
                    {record.value.subtitle}
                  </h2>
                  <div>
                    {fields.map((field, i) => {
                      if (
                        field[0] === 'coverImageUrl' ||
                        field[0] === 'title' ||
                        field[0] === 'subtitle' ||
                        field[0] === 'file' ||
                        field[0] === 'openlibraryUrl'
                      ) {
                        return
                      } else if (field[1]?.type === 'array') {
                        return (
                          <>
                            {record.value[field[0]] && (
                              <div key={i}>
                                <span className='text-blue-800'>
                                  {field[0]}
                                </span>
                                {record.value[field[0]].map(
                                  (item: string, i: number) => {
                                    return (
                                      <span
                                        key={i}
                                        className='mx-4 text-l text-slate-900'
                                      >
                                        {item}
                                      </span>
                                    )
                                  }
                                )}
                              </div>
                            )}
                          </>
                        )
                      } else {
                        return (
                          <div>
                            {record.value[field[0]] && (
                              <>
                                <span className='text-blue-800'>
                                  {field[0]}
                                </span>

                                <span
                                  key={i}
                                  className='mx-4 text-l text-slate-900'
                                >
                                  {record.value[field[0]]}
                                </span>
                              </>
                            )}
                          </div>
                        )
                      }
                    })}
                  </div>
                  <div key={i} className='flex'>
                    {record.value.file && (
                      <a className='mr-2' href={'/files/' + record.value.file}>
                        <div className='flex flex-row align-middle'>
                          <GrDocumentPdf />
                          <span className='mx-1 text-sm text-pink-600'>
                            Download
                          </span>
                        </div>
                      </a>
                    )}
                    {record.value.openlibraryUrl && (
                      <a href={record.value.openlibraryUrl}>
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
    </div>
  )
}
