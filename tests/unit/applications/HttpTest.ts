/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Path } from '@athenna/common'
import { Server } from '@athenna/http'
import { Config } from '@athenna/config'
import { Http } from '#src/applications/Http'
import { Test, type Context, Mock } from '@athenna/test'
import { BaseTest } from '#tests/helpers/BaseTest'
import { LoadHelper } from '#src/helpers/LoadHelper'
import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { HttpKernel } from '#tests/fixtures/kernels/HttpKernel'
import { HttpExceptionHandler } from '#tests/fixtures/handlers/HttpExceptionHandler'

export default class HttpTest extends BaseTest {
  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithoutAnyOption({ assert }: Context) {
    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
  }

  @Test()
  public async shouldNotLogThatTheHttpServerHasStartedIfRcBootLogsIsFalse({ assert }: Context) {
    Config.set('rc.bootLogs', false)

    const mock = Log.when('channelOrVanilla').return(undefined)

    await Http.boot()

    assert.isTrue(mock.notCalled)
    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
  }

  @Test()
  public async shouldBeAbleToLogThatTheHttpServerHasStartedIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const successFake = Mock.sandbox.fake()
    const mock = Log.when('channelOrVanilla').return({
      success: args => successFake(args)
    })

    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
    assert.calledTimesWith(mock, 2, 'application')
    assert.calledWith(successFake, 'Kernel ({yellow} HttpKernel) successfully booted')
    assert.calledWith(successFake, 'Http server started on ({yellow} 127.0.0.1:3000)')
  }

  @Test()
  public async shouldBeAbleToRegisterRoutesFromRoutesFileAndBootAHttpApplication({ assert }: Context) {
    await LoadHelper.preloadFiles()
    await Http.boot()

    const response = await Server.request().get('/hello')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { ok: true })
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterAHttpKernel({ assert }: Context) {
    await Http.boot({
      kernelPath: Path.fixtures('kernels/HttpKernel.ts')
    })

    assert.isTrue(CALLED_MAP.get(HttpKernel.name))
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterADifferentExceptionHandler({ assert }: Context) {
    await Http.boot({
      exceptionHandlerPath: Path.fixtures('handlers/HttpExceptionHandler.ts')
    })

    assert.isTrue(CALLED_MAP.get(HttpExceptionHandler.name))
  }

  @Test()
  public async shouldBeAbleToBootAHttpApplicationAndRegisterADifferentRouteFile({ assert }: Context) {
    await Http.boot({
      routePath: Path.fixtures('routes/http.ts')
    })

    const response = await Server.request().get('/hello')

    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.json(), { ok: true })
  }
}
