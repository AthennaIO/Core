/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Rc } from '@athenna/config'
import { Http } from '#src/applications/Http'
import { CommanderHandler } from '@athenna/artisan'
import { Log, LoggerProvider } from '@athenna/logger'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'
import { HttpServerProvider, HttpRouteProvider, Server, HttpKernel } from '@athenna/http'

export default class HttpTest {
  @BeforeEach()
  public async beforeEach() {
    new LoggerProvider().register()
    new HttpRouteProvider().register()
    new HttpServerProvider().register()
    await Config.loadAll(Path.fixtures('config'))
    await Rc.setFile(Path.fixtures('rcs/.athennarc.json'))
  }

  @AfterEach()
  public async afterEach() {
    ioc.reconstruct()
    Config.clear()
    Mock.restoreAll()
    CommanderHandler.reconstruct()
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplication({ assert }: Context) {
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot()

    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentHost({ assert }: Context) {
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ host: '0.0.0.0' })

    assert.calledOnceWith(listenMock, { host: '0.0.0.0', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentPort({ assert }: Context) {
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ port: 3001 })

    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3001 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentHttpKernel({ assert }: Context) {
    const infoMock = Log.when('info').return(undefined)
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ kernelPath: Path.fixtures('kernels/CustomHttpKernel.ts') })

    assert.calledOnceWith(infoMock, 'importing CustomHttpKernel')
    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentExceptionHandler({ assert }: Context) {
    const infoMock = Log.when('info').return(undefined)
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ exceptionHandlerPath: Path.fixtures('handlers/CustomHttpExceptionHandler.ts') })

    assert.calledOnceWith(infoMock, 'importing CustomHttpExceptionHandler')
    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithTracingPluginRegistered({ assert }: Context) {
    const registerRTraceMock = Mock.when(HttpKernel.prototype, 'registerRTracer').resolve(undefined)
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ trace: true })

    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
    assert.calledOnceWith(registerRTraceMock, true)
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterTheRouteFile({ assert }: Context) {
    const listenMock = Server.when('listen').resolve(undefined)

    assert.isFalse(Server.getRoutes().includes('└── / (GET, HEAD)'))

    await Http.boot({ routePath: Path.fixtures('routes/rest.ts') })

    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
    assert.isTrue(Server.getRoutes().includes('└── / (GET, HEAD)'))
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndLogTheBootstrapInfos({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot()

    assert.calledOnceWith(listenMock, { host: '127.0.0.1', port: 3000 })
    assert.calledWith(successMock, 'Http server started on ({yellow} 127.0.0.1:3000)')
    assert.calledWith(successMock, 'Kernel ({yellow} HttpKernel) successfully booted')
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndLogTheServerHostWithoutPort({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ host: 'athenna.io' })

    assert.calledOnceWith(listenMock, { host: 'athenna.io', port: 3000 })
    assert.calledWith(successMock, 'Http server started on ({yellow} athenna.io)')
    assert.calledWith(successMock, 'Kernel ({yellow} HttpKernel) successfully booted')
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndLogTheServerHostAsLocalHost({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })
    const listenMock = Server.when('listen').resolve(undefined)

    await Http.boot({ host: '::1' })

    assert.calledOnceWith(listenMock, { host: '::1', port: 3000 })
    assert.calledWith(successMock, 'Http server started on ({yellow} localhost:3000)')
    assert.calledWith(successMock, 'Kernel ({yellow} HttpKernel) successfully booted')
  }
}
