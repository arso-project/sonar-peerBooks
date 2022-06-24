import { useFetcher } from '@remix-run/react'
import { schema } from '~/schema'

interface FullFormProps {
  bookData: {
    [keys: string]: string
  }
  formErrors: FormErrors
  fileId: string
}

interface FormErrors {
  [key: string]: any
}

interface FormFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  formErrors: FormErrors
}

export function FormField({
  name,
  type,
  defaultValue,
  formErrors,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name}>{name}</label>
      <input
        className='block'
        type={type}
        name={name}
        id={name}
        defaultValue={defaultValue}
      />
      {formErrors?.get(name) ? (
        <p style={{ color: 'red' }}>{formErrors?.get(name)}</p>
      ) : null}
    </div>
  )
}

export function FullForm({ fileId, bookData, formErrors }: FullFormProps) {
  const fetcher = useFetcher()
  const fields = Object.keys(schema.types.Book.fields)
  return (
    <fetcher.Form action='/book/create' method='post'>
      {fields.map((field, i) => {
        if (field === 'file')
          return <input type={'hidden'} name={field} id='name' value={fileId} />
        return (
          <FormField
            key={i}
            name={field}
            defaultValue={bookData?.[field] || ''}
            formErrors={formErrors}
            type='text'
          />
        )
      })}

      <button className='m-4' type='submit'>
        Create Book Record
      </button>
    </fetcher.Form>
  )
}
