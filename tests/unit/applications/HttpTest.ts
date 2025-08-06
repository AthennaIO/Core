/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Rc } from '@athenna/config'
import { Path } from '@athenna/common'
import { Http } from '#src/applications/Http'
import { CommanderHandler } from '@athenna/artisan'
import { Log, LoggerProvider } from '@athenna/logger'
import { HttpServerProvider, HttpRouteProvider, Server } from '@athenna/http'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

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
    Server.when('listen').resolve(undefined)

    await Http.boot()

    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentHost({ assert }: Context) {
    Server.when('listen').resolve(undefined)

    await Http.boot({ host: '0.0.0.0' })

    assert.calledOnceWith(Server.listen, { host: '0.0.0.0', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentPort({ assert }: Context) {
    Server.when('listen').resolve(undefined)

    await Http.boot({ port: 3001 })

    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3001 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentHttpKernel({ assert }: Context) {
    Log.when('info').return(undefined)
    Server.when('listen').resolve(undefined)

    await Http.boot({ kernelPath: Path.fixtures('kernels/CustomHttpKernel.ts') })

    assert.calledOnceWith(Log.info, 'importing CustomHttpKernel')
    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithDifferentExceptionHandler({ assert }: Context) {
    Log.when('info').return(undefined)
    Server.when('listen').resolve(undefined)

    await Http.boot({ exceptionHandlerPath: Path.fixtures('handlers/CustomHttpExceptionHandler.ts') })

    assert.calledOnceWith(Log.info, 'importing CustomHttpExceptionHandler')
    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3000 })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterTheRouteFile({ assert }: Context) {
    Server.when('listen').resolve(undefined)

    assert.isFalse(Server.getRoutes().includes('└── / (GET, HEAD)'))

    await Http.boot({ routePath: Path.fixtures('routes/rest.ts') })

    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3000 })
    assert.isTrue(Server.getRoutes().includes('└── / (GET, HEAD)'))
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndLogTheBootstrapInfos({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })
    Server.when('listen').resolve(undefined)

    await Http.boot()

    assert.calledOnceWith(Server.listen, { host: '127.0.0.1', port: 3000 })
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
    Server.when('listen').resolve(undefined)

    await Http.boot({ host: 'athenna.io' })

    assert.calledOnceWith(Server.listen, { host: 'athenna.io', port: 3000 })
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
    Server.when('listen').resolve(undefined)

    await Http.boot({ host: '::1' })
    
    assert.calledOnceWith(Server.listen, { host: '::1', port: 3000 })
    assert.calledWith(successMock, 'Http server started on ({yellow} localhost:3000)')
    assert.calledWith(successMock, 'Kernel ({yellow} HttpKernel) successfully booted')
  }

  @Test()
  public async shouldThrowAnErrorWhenBootingAHttpApplicationToBeConsumedByAWSLambdaAndTheLibraryIsNotInstalled({
    assert
  }: Context) {
    Config.set('rc.bootLogs', true)

    assert.rejects(() => Http.boot({ isAWSLambda: true }), {
      message: 'The library @fastify/aws-lambda is not installed'
    })
  }
}
