/**
 * @athenna/template
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

describe('\n TemplateTest', () => {
  beforeAll(() => console.log(beforeAll.name))

  beforeEach(() => console.log(beforeEach.name))

  it('should be able to create and run tests with this template', async () => {
    expect(1).toBe(1)
  })

  afterEach(() => console.log(afterEach.name))

  afterAll(() => console.log(afterAll.name))
})
