import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import LandingPage from './LandingPage.jsx'
import { AuthProvider } from '../lib/auth.jsx'

describe('LandingPage', () => {
  it('renders the login page without crashing', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LandingPage />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /sign in to start with smart bharat/i })).toBeInTheDocument()
  })
})
