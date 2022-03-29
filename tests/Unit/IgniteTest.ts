/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from '../../src/Ignite'
import { File, Folder, Path } from '@secjs/utils'

describe('\n IgniteTest', () => {
  beforeAll(() => {
    new File(Path.tests('Stubs/.env.testing')).loadSync().copySync(Path.pwd('.env.testing'))
    new Folder(Path.tests('Stubs/config')).loadSync().copySync(Path.pwd('config'))
    new Folder(Path.tests('Stubs/start')).loadSync().copySync(Path.pwd('start'))
  })

  it('should be able to ignite an Athenna http project', async () => {
    const app = await new Ignite(__filename).httpServer()

    expect(Env('APP_NAME')).toBe('Athenna')
    expect(Env('APP_DOMAIN')).toBe('http://localhost:1335')

    expect(Config.get('app.name')).toBe('Athenna')
    expect(Config.get('app.domain')).toBe('http://localhost:1335')

    const { json, statusCode } = await app.getServer().inject({
      method: 'GET',
      url: '/healthcheck',
    })

    expect(statusCode).toBe(200)
    expect(json()).toStrictEqual({ status: 'ok' })

    await app.close()
  })

  afterAll(() => {
    new Folder(Path.pwd('config')).removeSync()
    new Folder(Path.pwd('start')).removeSync()
    new File(Path.pwd('.env.testing')).removeSync()
  })
})
