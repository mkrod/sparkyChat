import type { FC, JSX } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router'
import RootLayout from './layouts/root_layout'
import { ChatProvider } from './constants/providers/chatProvider'
import Landing from './pages/onboard/land'
import NotFound from './pages/404'
import AuthLayout from './layouts/auth_layout'
import Auth from './pages/auth/auth'
import AppLayout from './layouts/app_layout'
import AppHome from './pages/app'
import { DataProvider } from './constants/providers/data_provider'
import CallHome from './pages/app/calls/call_home'

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
          <Route path='calls' element={<CallHome />} />

        </Route>
      </Route>
    )
  )
  return (
      <DataProvider> {/* Moved Connection provider and others to wrap just app layout cause there are only needed when user is in */}
        <ChatProvider>
          <RouterProvider router={router} />
        </ChatProvider>
      </DataProvider>
  )
}

export default App;