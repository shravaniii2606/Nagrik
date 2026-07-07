import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ComplaintsPage from './pages/ComplaintsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ReportIssuePage from './pages/ReportIssuePage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ServicesPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'report', element: <ReportIssuePage /> },
      { path: 'complaints', element: <ComplaintsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
