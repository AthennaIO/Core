/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config, Env } from '@athenna/config'
import { File, Folder, Path } from '@secjs/utils'

import { Application, Ignite } from '#src/index'
import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

test.group('IgniteTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new Folder(Path.stubs('routes')).copy(Path.routes())
    await new Folder(Path.stubs('providers')).copy(Path.providers())
    await new File(Path.stubs('.env.test')).copy(Path.pwd('.env.test'))
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.routes())
    await Folder.safeRemove(Path.providers())
    await File.safeRemove(Path.pwd('.env.test'))
    ioc.reconstruct()
  })

  test('should throw null application exception when application is not fired', async ({ assert }) => {
    const useCase = () => new Ignite().getApplication()

    assert.throws(useCase, NullApplicationException)
  })

  test('should be able to handle application errors on bootstrap', async ({ assert }) => {
    process.env.THROW_ERROR_PROVIDER = 'true'

    const ignite = new Ignite()

    await ignite.fire()

    process.env.THROW_ERROR_PROVIDER = null
  })

  test('should be able to handle application exceptions on bootstrap', async ({ assert }) => {
    process.env.THROW_EXCEPTION_PROVIDER = 'true'

    const ignite = new Ignite()

    await ignite.fire()

    process.env.THROW_EXCEPTION_PROVIDER = null
  })

  test('should be able to get the application from ignite class', async ({ assert }) => {
    const ignite = new Ignite()

    await ignite.fire()

    assert.instanceOf(ignite.getApplication(), Application)
  })

  test('should be able to ignite an Athenna http application', async ({ assert }) => {
    process.env.ATHENNA_APPLICATIONS = 'http'

    const application = await new Ignite().fire()
    const httpServer = await application.bootHttpServer()

    assert.isFalse(ioc.hasDependency('Athenna/Artisan/Test'))

    assert.equal(Env('APP_NAME'), 'Athenna')
    assert.equal(Env('APP_DOMAIN'), 'http://localhost:1335')

    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('http.domain'), 'http://localhost:1335')

    const { json, statusCode, headers } = await httpServer.request({
      method: 'GET',
      url: '/healthcheck',
    })

    assert.equal(statusCode, 200)
    assert.deepEqual(json(), { status: 'ok' })

    assert.equal(headers['access-control-expose-headers'], '*')
    assert.equal(headers['x-ratelimit-limit'], 1000)
    assert.equal(headers['x-ratelimit-remaining'], 999)
    assert.equal(headers['x-ratelimit-reset'], 60)

    await application.shutdownHttpServer()
  })

  test('should be able to ignite an Athenna artisan application', async ({ assert }) => {
    process.env.ATHENNA_APPLICATIONS = 'artisan'

    const application = await new Ignite().fire()
    const artisan = await application.bootArtisan()

    assert.isTrue(ioc.hasDependency('Athenna/Artisan/Test'))

    assert.equal(Env('APP_NAME'), 'Athenna')
    assert.equal(Env('APP_DOMAIN'), 'http://localhost:1335')

    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('http.domain'), 'http://localhost:1335')

    await artisan.call('make:controller TestController')
  })
})
