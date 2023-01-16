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
import { File, Folder, Path } from '@athenna/common'

import { Application, Ignite, ProviderHelper } from '#src/index'
import { OnlyArtisanProvider } from '#tests/Stubs/providers/OnlyArtisanProvider'
import { NullApplicationException } from '#src/Exceptions/NullApplicationException'

test.group('IgniteTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new Folder(Path.stubs('routes')).copy(Path.routes())
    await new Folder(Path.stubs('providers')).copy(Path.providers())
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
    await new File(Path.stubs('.env.test')).copy(Path.pwd('.env.test'))
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.routes())
    await Folder.safeRemove(Path.providers())
    await File.safeRemove(Path.pwd('.env'))
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

    await ignite.fire(import.meta.url)

    process.env.THROW_ERROR_PROVIDER = null
  })

  test('should be able to handle application exceptions on bootstrap', async ({ assert }) => {
    process.env.THROW_EXCEPTION_PROVIDER = 'true'

    const ignite = new Ignite()

    await ignite.fire(import.meta.url)

    process.env.THROW_EXCEPTION_PROVIDER = null
  })

  test('should be able to get the application from ignite class', async ({ assert }) => {
    const ignite = new Ignite()

    await ignite.fire(import.meta.url)

    assert.instanceOf(ignite.getApplication(), Application)
  })

  test('should be able to ignite an Athenna http application and graceful shutdown', async ({ assert }) => {
    process.env.ATHENNA_APPLICATIONS = 'http'

    const application = await new Ignite().fire(import.meta.url)
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

    /**
     * This will call the 'gracefulShutdown' property of config/app.js.
     * The process will not be killed since "process.exit" is mocked.
     */
    process.kill(process.pid, 'SIGINT')
  })

  test('should be able to ignite an Athenna artisan application', async ({ assert }) => {
    process.env.ATHENNA_APPLICATIONS = 'artisan'

    const application = await new Ignite().fire(import.meta.url)
    const artisan = await application.bootArtisan()

    assert.isTrue(ioc.hasDependency('Athenna/Artisan/Test'))

    assert.equal(Env('APP_NAME'), 'Athenna')
    assert.equal(Env('APP_DOMAIN'), 'http://localhost:1335')

    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('http.domain'), 'http://localhost:1335')

    await artisan.call('make:controller TestController')
  })

  test('should be able to ignite an Athenna REPL application and force shutdown', async ({ assert }) => {
    process.env.ATHENNA_APPLICATIONS = 'repl'

    const application = await new Ignite().fire(import.meta.url)
    const repl = await application.bootREPL()

    assert.equal(Env('APP_NAME'), 'Athenna')
    assert.equal(Env('APP_DOMAIN'), 'http://localhost:1335')

    assert.equal(Config.get('app.name'), 'Athenna')
    assert.equal(Config.get('http.domain'), 'http://localhost:1335')

    assert.equal(repl.context.Hello.world(), 'hello world')
    repl.write('throw new Error("Testing uncaught handler")\n')
    repl.write('.exit\n')
  })

  test('should be able to specify which providers should run by ignite options', async ({ assert }) => {
    await new Ignite().fire(import.meta.url, {
      bootLogs: true,
      providers: [import('../Stubs/providers/OnlyArtisanProvider.js')],
    })

    assert.equal(ProviderHelper.getAll()[0], OnlyArtisanProvider)
  })
})
