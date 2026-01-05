import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Test from './test/Test.tsx'
import Paint from './paint/Paint.tsx'
import Home from './Home.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/paint",
    element: <Paint />
  },
  {
    path: "/config",
    element: <Test />
  }
], {
  basename: "/ex6/"
})


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
