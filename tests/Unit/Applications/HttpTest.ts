/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Http } from '#src/Applications/Http'
import { Folder, Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { LoadHelper } from '#src/Helpers/LoadHelper'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { HttpKernel } from '#tests/Stubs/kernels/HttpKernel'
import { Test, AfterEach, BeforeEach, TestContext } from '@athenna/test'
import { HttpRouteProvider, HttpServerProvider, Server } from '@athenna/http'
import { HttpExceptionHandler } from '#tests/Stubs/handlers/HttpExceptionHandler'

export default class HttpTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    await Config.loadAll(Path.stubs('config'))
    new LoggerProvider().register()
    new HttpRouteProvider().register()
    new HttpServerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    await Folder.safeRemove(Path.stubs('storage'))

    await new HttpServerProvider().shutdown()
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithoutAnyOption({ assert }: TestContext) {
    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '::1')
  }

  @Test()
  public async shouldBeAbleToRegisterRoutesFromRoutesFileAndBootAHttpApplication({ assert }: TestContext) {
    await LoadHelper.preloadFiles()
    await Http.boot()

    const response = await Server.request().get('/hello')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { ok: true })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterAHttpKernel({ assert }: TestContext) {
    await Http.boot({
      kernelPath: Path.stubs('kernels/HttpKernel.ts'),
    })

    assert.isTrue(CALLED_MAP.get(HttpKernel.name))
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterADifferentExceptionHandler({ assert }: TestContext) {
    await Http.boot({
      exceptionHandlerPath: Path.stubs('handlers/HttpExceptionHandler.ts'),
    })

    assert.isTrue(CALLED_MAP.get(HttpExceptionHandler.name))
  }
}
