import { Workspace } from '@arsonar/client'
import type { Collection } from '@arsonar/client'
import Dotenv from 'dotenv'
import { schema } from './schema'
import { extractTextFromFile } from './lib/extract.js'

Dotenv.config()

const url = process.env.SONAR_URL || 'http://localhost:9191/api/v1/default'
const token = process.env.SONAR_TOKEN

// Initializing a client
export const workspace = new Workspace({
  url,
  accessCode: token,
})

export default workspace

let collection: Collection | undefined

export const collectionName = process.env.SONAR_COLLECTION || 'default'

async function ensureSchema(collection: Collection) {
  collection.schema!.setDefaultNamespace(schema.defaultNamespace)
  for (const [name, type] of Object.entries(schema.types)) {
    if (!collection.schema!.hasType(name)) {
      const spec = { name, ...type }
      await collection.putType(spec)
      console.log('created type', name)
    }
  }
}

export async function openCollection(): Promise<Collection> {
  if (!collection) {
    try {
      collection = await workspace.openCollection(collectionName)
    } catch (err: any) {
      collection = await workspace.createCollection(collectionName)
    }
    await ensureSchema(collection)
  }
  return collection
}

export async function createBookRecord(data: any) {
  const collection = await openCollection()
  const fileId = data.file
  const fullText = await extractTextFromFile(collection, fileId)
  if (fullText.fullText) data.fullText = fullText.fullText
  const record = await collection.put({
    type: 'Book',
    value: data,
  })
  return record
}

interface uploadFileToSonarProps {
  contentType: string
  data: AsyncIterable<Uint8Array>
  filename: string | undefined
}

export async function uploadFileToSonar({
  contentType,
  data,
  filename,
}: uploadFileToSonarProps) {
  const collection = await openCollection()
  let fileRecord
  try {
    fileRecord = await collection.files.createFile(data, {
      filename,
      contentType,
    })
  } catch (err: any) {
    return { error: err }
  }
  return fileRecord.id
}
