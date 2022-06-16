import { TypeSpecInput } from '@arsonar/client'

type Spec = {
  defaultNamespace: string
  types: Record<string, TypeSpecInput>
}

export const schema: Spec = {
  defaultNamespace: 'sonar-peerBooks',
  types: {
    ImportedMetadata: {
      title: 'Imported metadata',
      fields: {
        sourcePlatform: {
          type: 'string',
        },
        content: {
          type: 'object',
        },
      },
    },
    Book: {
      title: 'book',
      fields: {
        title: {
          type: 'string',
        },
        isbn: {
          type: 'string',
        },
        identifiers: {
          type: 'array',
        },
        publishers: {
          type: 'array',
        },
        openLibraryUrl: {
          type: 'string',
        },
        inLanguage: {
          type: 'string',
        },
        genre: {
          type: 'string',
        },
        authors: {
          type: 'array',
        },
        description: {
          type: 'string',
        },
        coverImageUrl: {
          type: 'string',
        },
      },
    },
  },
}
