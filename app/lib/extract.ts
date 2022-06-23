import { Collection } from "@arsonar/client/index.js";
import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract'
import { Readable } from 'node:stream'
import { file as createTempFile } from 'tmp-promise'
import fs from 'fs/promises'

export type ExtractResult = {
  fullText?: string
}

export async function extractTextFromFile(collection: Collection, fileId: string): Promise<ExtractResult> {
  const fileStream = await collection.files.readFile(fileId)
  const { path, cleanup } = await createTempFile()
  await fs.writeFile(path, Readable.from(fileStream))
  const result: ExtractResult = {}
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extract(path)
    let text = ''
    // @ts-ignore
    if (data.meta?.metadata && data.meta.metadata['dc:title']) text += data.meta.metadata['dc:title']
    for (const page of data.pages) {
      for (const area of page.content) {
        text += ' ' + area.str
      }
    }
    result.fullText = text
  } catch (err) {
    console.error('Text extraction failed', err)
  }
  await cleanup()
  return result
}
