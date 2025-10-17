import type { FC, JSX } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import RootLayout from './layouts/root_layout'
import { ChatProvider } from './constants/chatProvider'
import Landing from './pages/onboard/land'
import NotFound from './pages/404'
import AuthLayout from './layouts/auth_layout'
import Auth from './pages/auth/auth'

const App: FC = (): JSX.Element => {


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
        <Route path='*' element={<NotFound />} />
        <Route index element={<Landing />} />

        <Route path='auth' element={<AuthLayout />}>
          <Route index element={<Auth />} />
        </Route>
      </Route>
    )
  )
  return (
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  )
}

export default App;