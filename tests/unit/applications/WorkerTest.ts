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
import { Worker } from '#src/applications/Worker'
import { CommanderHandler } from '@athenna/artisan'
import { Log, LoggerProvider } from '@athenna/logger'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'
import { Queue, QueueProvider, WorkerProvider, WorkerTaskBuilder } from '@athenna/queue'

export default class WorkerTest {
  private workerTaskBuilder: WorkerTaskBuilder

  @BeforeEach()
  public async beforeEach() {
    new LoggerProvider().register()
    new QueueProvider().register()
    new WorkerProvider().register()

    await Config.loadAll(Path.fixtures('config'))

    this.workerTaskBuilder = new WorkerTaskBuilder()
    Mock.when(this.workerTaskBuilder, 'handler').return(undefined)
    Queue.worker().when('task').return(this.workerTaskBuilder)

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
  public async shouldBeAbleToBootAWorkerApplication({ assert }: Context) {
    await Worker.boot()

    assert.called(this.workerTaskBuilder.handler)
  }

  @Test()
  public async shouldBeAbleToBootAWorkerApplicationWithDifferentWorkerKernel({ assert }: Context) {
    Log.when('info').return(undefined)

    await Worker.boot({ kernelPath: Path.fixtures('kernels/CustomWorkerKernel.ts') })

    assert.calledOnceWith(Log.info, 'importing CustomWorkerKernel')
  }

  @Test()
  public async shouldBeAbleToBootAWorkerApplicationAndRegisterTheRouteFile({ assert }: Context) {
    await Worker.boot({ routePath: Path.fixtures('routes/worker.ts') })

    assert.called(this.workerTaskBuilder.handler)
  }

  @Test()
  public async shouldBeAbleToBootAWorkerApplicationAndLogTheBootstrapInfos({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })

    await Worker.boot()

    assert.calledWith(successMock, 'Worker application successfully started')
    assert.calledWith(successMock, 'Kernel ({yellow} WorkerKernel) successfully booted')
  }
}
