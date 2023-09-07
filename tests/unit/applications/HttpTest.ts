/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake } from 'sinon'
import { Log } from '@athenna/logger'
import { Path } from '@athenna/common'
import { Server } from '@athenna/http'
import { Config } from '@athenna/config'
import { Http } from '#src/applications/Http'
import { Test, type Context } from '@athenna/test'
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

    const mock = Log.getMock()

    mock.expects('channelOrVanilla').exactly(0)

    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
    mock.verify()
  }

  @Test()
  public async shouldBeAbleToLogThatTheHttpServerHasStartedIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(2)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
    assert.isTrue(successFake.calledWith('Kernel ({yellow} HttpKernel) successfully booted'))
    assert.isTrue(successFake.calledWith('Http server started on ({yellow} 127.0.0.1:3000)'))
    mock.verify()
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
