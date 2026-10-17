import { render, screen } from '@testing-library/react';
import App from './App';

test('renders AgriGuide brand title', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/AgriGuide/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
