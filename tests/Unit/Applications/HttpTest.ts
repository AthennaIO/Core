/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { Http } from '#src/Applications/Http'
import { Folder, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { LoadHelper } from '#src/Helpers/LoadHelper'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { HttpKernel } from '#tests/Stubs/kernels/HttpKernel'
import { HttpRouteProvider, HttpServerProvider, Server } from '@athenna/http'
import { HttpExceptionHandler } from '#tests/Stubs/handlers/HttpExceptionHandler'

test.group('HttpTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new LoggerProvider().register()
    new HttpRouteProvider().register()
    new HttpServerProvider().register()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.stubs('storage'))

    await new HttpServerProvider().shutdown()
  })

  test('should be able to boot a http application without any option', async ({ assert }) => {
    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '::1')
  })

  test('should be able to register routes from routes file and boot a http application', async ({ assert }) => {
    await LoadHelper.preloadFiles()
    await Http.boot()

    const response = await Server.request().get('/hello')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { ok: true })
  })

  test('should be able to boot a http application and register a different http kernel', async ({ assert }) => {
    await Http.boot({
      kernelPath: Path.stubs('kernels/HttpKernel.ts'),
    })

    assert.isTrue(CALLED_MAP.get(HttpKernel.name))
  })

  test('should be able to boot an artisan application and register a different exception handler', async ({
    assert,
  }) => {
    await Http.boot({
      kernelPath: Path.stubs('kernels/HttpKernel.ts'),
      exceptionHandlerPath: Path.stubs('handlers/HttpExceptionHandler.ts'),
    })

    assert.isTrue(CALLED_MAP.get(HttpKernel.name))
    assert.isTrue(CALLED_MAP.get(HttpExceptionHandler.name))
  })
})
