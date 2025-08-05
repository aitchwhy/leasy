// (1) write list of test scenarios to cover
// (2) implement exactly 1 test case into runnable (which fails)
// (3) change code to make test + previous tests pass
// (4) (optional) refactor to improve code
// (5) repeat from 2 until all tests covered

import { expect, test } from '@playwright/test'

test('GET / returns 200 OK Hello World', async({request}) => {
    const res = await request.get("/")
    expect(res.status()).toBe(200)
})
