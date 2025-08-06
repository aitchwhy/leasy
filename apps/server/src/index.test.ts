import { describe, expect, it } from 'vitest'
import app from './index'

describe('App', () => {
    it('GET / returns 200 OK', async () => {
        const res = await app.request('/')
        expect(res.ok).toBeTruthy()
        expect(await res.text()).toBe('OK')
    })
})
