/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Log } from '@athenna/logger'
import { Config } from '@athenna/config'
import { File, Path } from '@athenna/common'
import { ViewProvider } from '@athenna/view'
import { ArtisanProvider } from '@athenna/artisan'
import { BaseTest } from '#tests/helpers/BaseTest'
import { Artisan } from '#src/applications/Artisan'
import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { Test, type Context, Mock } from '@athenna/test'
import { ConsoleKernel } from '#tests/fixtures/kernels/ConsoleKernel'
import { ConsoleExceptionHandler } from '#tests/fixtures/handlers/ConsoleExceptionHandler'

export default class ArtisanTest extends BaseTest {
  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationWithoutAnyOption({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan'])

    assert.isTrue(this.processExitMock.called)
  }

  @Test()
  public async shouldBeAbleToLogThatTheConsoleKernelIsBootingIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const successFake = Mock.sandbox.fake()
    const mock = Log.when('channelOrVanilla').return({
      success: args => successFake(args)
    })

    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan'])

    assert.called(this.processExitMock)
    assert.calledTimesWith(mock, 1, 'application')
    assert.isTrue(successFake.calledWith('Kernel ({yellow} ConsoleKernel) successfully booted'))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterCommandsFromRoutes({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.fixtures('routes/console.ts')
    })

    assert.isTrue(this.processExitMock.called)
    assert.isTrue(await File.exists(Path.fixtures('storage/Command.ts')))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterAConsoleKernel({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.fixtures('routes/console.ts'),
      kernelPath: Path.fixtures('kernels/ConsoleKernel.ts')
    })

    assert.isTrue(this.processExitMock.called)
    assert.isTrue(CALLED_MAP.get(ConsoleKernel.name))
    assert.isTrue(await File.exists(Path.fixtures('storage/Command.ts')))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterAConsoleExceptionHandler({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.fixtures('routes/console.ts'),
      exceptionHandlerPath: Path.fixtures('handlers/ConsoleExceptionHandler.ts')
    })

    assert.isTrue(this.processExitMock.called)
    assert.isTrue(CALLED_MAP.get(ConsoleExceptionHandler.name))
    assert.isTrue(await File.exists(Path.fixtures('storage/Command.ts')))
  }
}
