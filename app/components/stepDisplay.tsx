enum Steps {
  One = 1,
  Two = 2,
  Three = 3,
}

interface ImportMenuProps {
  step: Steps
}

export function StepDisplay({ step }: ImportMenuProps) {
  const active = 'bg-slate-900'
  const bgOne = step == Steps.One && active
  const bgTwo = step == Steps.Two && active
  const bgThree = step == Steps.Three && active

  return (
    <div className='bg-gray-200 text-white flex'>
      <div className={'p-4 text-center w-full ' + bgOne}>
        <span>Step 1 - Select or import a PDF</span>
      </div>
      <div className={'p-4 text-center w-full ' + bgTwo}>
        <span>Step 2 (optional) - Load Metadata</span>
      </div>
      <div className={'p-4 text-center w-full ' + bgThree}>
        <span>Step 3 - Create Book Record</span>
      </div>
    </div>
  )
}
