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
import { Cron } from '#src/applications/Cron'
import { CommanderHandler } from '@athenna/artisan'
import { Log, LoggerProvider } from '@athenna/logger'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'
import { Cron as CronFacade, CronProvider, CronKernel, CronBuilder } from '@athenna/cron'

export default class CronTest {
  private cronBuilder: CronBuilder
  @BeforeEach()
  public async beforeEach() {
    new CronProvider().register()

    this.cronBuilder = new CronBuilder()
    Mock.when(this.cronBuilder, 'handler').return(undefined)
    CronFacade.when('schedule').return(this.cronBuilder)

    new LoggerProvider().register()
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
  public async shouldBeAbleToBootACronApplication({ assert }: Context) {
    await Cron.boot()

    assert.called(this.cronBuilder.handler)
  }

  @Test()
  public async shouldBeAbleToBootACronApplicationWithDifferentCronKernel({ assert }: Context) {
    Log.when('info').return(undefined)

    await Cron.boot({ kernelPath: Path.fixtures('kernels/CustomCronKernel.ts') })

    assert.calledOnceWith(Log.info, 'importing CustomCronKernel')
  }

  @Test()
  public async shouldBeAbleToBootACronApplicationWithDifferentExceptionHandler({ assert }: Context) {
    Log.when('info').return(undefined)

    await Cron.boot({ exceptionHandlerPath: Path.fixtures('handlers/CustomCronExceptionHandler.ts') })

    assert.calledOnceWith(Log.info, 'importing CustomCronExceptionHandler')
  }

  @Test()
  public async shouldBeAbleToBootACronApplicationWithTracingPluginRegistered({ assert }: Context) {
    Mock.when(CronKernel.prototype, 'registerRTracer').resolve(undefined)

    await Cron.boot({ trace: true })

    assert.calledOnceWith(CronKernel.prototype.registerRTracer, true)
  }

  @Test()
  public async shouldBeAbleToBootACronApplicationAndRegisterTheRouteFile({ assert }: Context) {
    await Cron.boot({ routePath: Path.fixtures('routes/cron.ts') })

    assert.called(this.cronBuilder.handler)
  }

  @Test()
  public async shouldBeAbleToBootACronApplicationAndLogTheBootstrapInfos({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })

    await Cron.boot()

    assert.calledWith(successMock, 'Cron application successfully started')
    assert.calledWith(successMock, 'Kernel ({yellow} CronKernel) successfully booted')
  }
}
