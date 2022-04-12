/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from 'src/Ignite'
import { File, Folder, Path } from '@secjs/utils'

describe('\n IgniteTest', () => {
  beforeAll(() => {
    new File(Path.tests('Stubs/.env.test')).loadSync().copySync(Path.pwd('.env.test'))
    new Folder(Path.tests('Stubs/config')).loadSync().copySync(Path.pwd('config'))
    new Folder(Path.tests('Stubs/routes')).loadSync().copySync(Path.pwd('routes'))
    new Folder(Path.tests('Stubs/app')).copySync(Path.pwd('app'))
    new File(Path.tests('Stubs/app/Http/Kernel.ts')).copySync(Path.pwd('app/Http/Kernel.ts'))
  })

  it('should be able to ignite an Athenna http project', async () => {
    const application = await new Ignite(__filename).fire()
    const httpServer = await application.bootHttpServer()

    expect(Env('APP_NAME')).toBe('Athenna')
    expect(Env('APP_DOMAIN')).toBe('http://localhost:1335')

    expect(Config.get('app.name')).toBe('Athenna')
    expect(Config.get('http.domain')).toBe('http://localhost:1335')

    const { json, statusCode, headers } = await httpServer.request({
      method: 'GET',
      url: '/healthcheck',
    })

    expect(statusCode).toBe(200)
    expect(json()).toStrictEqual({ status: 'ok' })

    expect(headers['access-control-expose-headers']).toBe('*')
    expect(headers['x-ratelimit-limit']).toBe(1000)
    expect(headers['x-ratelimit-remaining']).toBe(999)
    expect(headers['x-ratelimit-reset']).toBe(60)

    await application.shutdownHttpServer()
  })

  afterAll(() => {
    new Folder(Path.pwd('app')).removeSync()
    new Folder(Path.pwd('config')).removeSync()
    new Folder(Path.pwd('routes')).removeSync()
    new File(Path.pwd('.env.test')).removeSync()
  })
})
