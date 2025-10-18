import type { FC, JSX } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import RootLayout from './layouts/root_layout'
import { ChatProvider } from './constants/chatProvider'
import Landing from './pages/onboard/land'
import NotFound from './pages/404'
import AuthLayout from './layouts/auth_layout'
import Auth from './pages/auth/auth'
import AppLayout from './layouts/app_layout'
import AppHome from './pages/app'
import { ConnectionProvider } from './constants/conn_provider'

const App: FC = (): JSX.Element => {


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<RootLayout/>}>
        <Route path='*' element={<NotFound />} />
        <Route index element={<Landing />} />

        <Route path='auth' element={<AuthLayout />}>
          <Route index element={<Auth />} />
        </Route>

        <Route path='app' element={<AppLayout />}>
          <Route index element={<AppHome />} />

        </Route>
      </Route>
    )
  )
  return (
    <ChatProvider>
      <ConnectionProvider>
       <RouterProvider router={router} />
      </ConnectionProvider>
    </ChatProvider>
  )
}

export default App;