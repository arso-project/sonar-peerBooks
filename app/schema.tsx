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
        subtitle: {
          type: 'string',
        },
        coverImageUrl: {
          type: 'string',
        },
        isbn_10: {
          type: 'string',
        },
        isbn_13: {
          type: 'string',
        },
        number_of_pages: {
          type: 'string',
        },
        excerpt: {
          type: 'string',
        },
        openlibraryId: {
          type: 'array',
        },
        publishers: {
          type: 'array',
        },
        publish_date: {
          type: 'string',
        },
        openlibraryUrl: {
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

        file: {
          type: 'string',
        },
        fullText: {
          type: 'string'
        }
      },
    },
  },
}
