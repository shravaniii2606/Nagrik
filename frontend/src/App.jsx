import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ComplaintsPage from './pages/ComplaintsPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ReportIssuePage from './pages/ReportIssuePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      { path: 'services', element: <ServicesPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'report', element: <ReportIssuePage /> },
      { path: 'complaints', element: <ComplaintsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
