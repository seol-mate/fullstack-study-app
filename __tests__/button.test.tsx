import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('Button 렌더링', () => {
  render(<Button>저장</Button>)
  expect(screen.getByRole('button', { name: '저장' })).toBeDefined()
})
