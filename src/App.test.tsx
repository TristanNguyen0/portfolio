import { render, screen } from '@testing-library/react'
import App from './App'

test('renders the name and all three sections', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /tristan nguyen/i })).toBeInTheDocument()
  expect(screen.getByText(/CAD & 3D printing/i)).toBeInTheDocument()
  expect(screen.getByText(/Homelab/i)).toBeInTheDocument()
})