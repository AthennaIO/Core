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
import { Http } from '#src/Applications/Http'
import { Test, TestContext } from '@athenna/test'
import { BaseTest } from '#tests/Helpers/BaseTest'
import { LoadHelper } from '#src/Helpers/LoadHelper'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { HttpKernel } from '#tests/Stubs/kernels/HttpKernel'
import { HttpExceptionHandler } from '#tests/Stubs/handlers/HttpExceptionHandler'

export default class HttpTest extends BaseTest {
  @Test()
  public async shouldBeAbleToBootAHttpApplicationWithoutAnyOption({ assert }: TestContext) {
    await Http.boot()

    assert.isTrue(Server.isListening)
    assert.equal(Server.getPort(), 3000)
    assert.equal(Server.getHost(), '127.0.0.1')
  }

  @Test()
  public async shouldNotLogThatTheHttpServerHasStartedIfRcBootLogsIsFalse({ assert }: TestContext) {
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
  public async shouldBeAbleToLogThatTheHttpServerHasStartedIfRcBootLogsIsTrue({ assert }: TestContext) {
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
