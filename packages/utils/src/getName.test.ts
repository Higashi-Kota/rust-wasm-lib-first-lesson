import { describe, expect, it } from 'vitest'
import { getName } from './getName'

describe('getName', () => {
  it('should return the original name when no conflicts exist', () => {
    const result = getName('Panel', [])
    expect(result).toBe('Panel')
  })

  it('should return the original name when it does not conflict with others', () => {
    const result = getName('Panel', ['Other', 'Different'])
    expect(result).toBe('Panel')
  })

  it('should add (1) when the original name already exists', () => {
    const result = getName('Panel', ['Panel'])
    expect(result).toBe('Panel (1)')
  })

  it('should increment the number when multiple conflicts exist', () => {
    const result = getName('Panel', ['Panel', 'Panel (1)'])
    expect(result).toBe('Panel (2)')
  })

  it('should find the next available number in sequence', () => {
    const result = getName('Panel', [
      'Panel',
      'Panel (1)',
      'Panel (2)',
      'Panel (3)',
    ])
    expect(result).toBe('Panel (4)')
  })

  it('should handle gaps in numbering sequence', () => {
    const result = getName('Panel', ['Panel', 'Panel (3)', 'Panel (5)'])
    expect(result).toBe('Panel (1)')
  })

  it('should handle names that already have numbers', () => {
    const result = getName('Panel (2)', ['Panel (2)'])
    expect(result).toBe('Panel (3)')
  })

  it('should work with different base names', () => {
    const result = getName('Document', ['Document', 'Document (1)'])
    expect(result).toBe('Document (2)')
  })

  it('should handle empty base name', () => {
    const result = getName('', [''])
    expect(result).toBe(' (1)')
  })

  it('should be case sensitive', () => {
    const result = getName('panel', ['Panel'])
    expect(result).toBe('panel')
  })

  it('should handle special characters in names', () => {
    const result = getName('Panel-Test', ['Panel-Test'])
    expect(result).toBe('Panel-Test (1)')
  })

  it('should handle large numbers correctly', () => {
    const existing = ['Panel']
    for (let i = 1; i <= 100; i++) {
      existing.push(`Panel (${i})`)
    }
    const result = getName('Panel', existing)
    expect(result).toBe('Panel (101)')
  })
})
