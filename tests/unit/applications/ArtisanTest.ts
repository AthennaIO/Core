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
import { Config } from '@athenna/config'
import { File, Path } from '@athenna/common'
import { ViewProvider } from '@athenna/view'
import { ArtisanProvider } from '@athenna/artisan'
import { BaseTest } from '#tests/helpers/BaseTest'
import { Artisan } from '#src/applications/Artisan'
import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { Test, ExitFaker, type Context } from '@athenna/test'
import { ConsoleKernel } from '#tests/fixtures/kernels/ConsoleKernel'
import { ConsoleExceptionHandler } from '#tests/fixtures/handlers/ConsoleExceptionHandler'

export default class ArtisanTest extends BaseTest {
  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationWithoutAnyOption({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan'])

    assert.isTrue(ExitFaker.faker.called)
  }

  @Test()
  public async shouldBeAbleToLogThatTheConsoleKernelIsBootingIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(1)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan'])

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(successFake.calledWith('Kernel ({yellow} ConsoleKernel) successfully booted'))
    mock.verify()
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterCommandsFromRoutes({ assert }: Context) {
    new ViewProvider().register()
    new ArtisanProvider().register()

    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.fixtures('routes/console.ts')
    })

    assert.isTrue(ExitFaker.faker.called)
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

    assert.isTrue(ExitFaker.faker.called)
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

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(CALLED_MAP.get(ConsoleExceptionHandler.name))
    assert.isTrue(await File.exists(Path.fixtures('storage/Command.ts')))
  }
}
