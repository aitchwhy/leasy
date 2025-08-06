import { describe, expect, it } from 'vitest'

describe('index', () => {
    it('should return 200 OK', async () => {
        const res = await fetch('http://localhost:3000')
        expect(res.ok).toBeTruthy()
        expect(await res.text()).toBe('OK')
    })
})
