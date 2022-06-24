enum Steps {
  One = 1,
  Two = 2,
  Three = 3,
}

interface ImportMenuProps {
  step: Steps
}

export function ImportMenu({ step }: ImportMenuProps) {
  const bgOne = step == Steps.One && 'bg-pink-600'
  const bgTwo = step == Steps.Two && 'bg-pink-600'
  const bgThree = step == Steps.Three && 'bg-pink-600'

  return (
    <div className='bg-gray-200 text-white flex'>
      <div className={'p-4 text-center w-full ' + bgOne}>
        <h3>Step 1 - Select or import a PDF</h3>
      </div>
      <div className={'p-4 text-center w-full ' + bgTwo}>
        <h3>Step 2 (optional) - Load Metadata</h3>
      </div>
      <div className={'p-4 text-center w-full ' + bgThree}>
        <h3>Step 3 - Create Book Record</h3>
      </div>
    </div>
  )
}
