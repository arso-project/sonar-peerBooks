import { Outlet } from '@remix-run/react'

export default function Book() {
  return (
    <div>
      Hello <Outlet />
    </div>
  )
}
