/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { LoggerProvider } from '@athenna/logger'
import { Artisan } from '#src/Applications/Artisan'
import { ExitFaker } from '#tests/Helpers/ExitFaker'
import { File, Folder, Path } from '@athenna/common'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { ConsoleKernel } from '#tests/Stubs/kernels/ConsoleKernel'
import { Test, AfterEach, BeforeEach, TestContext } from '@athenna/test'
import { ConsoleExceptionHandler } from '#tests/Stubs/handlers/ConsoleExceptionHandler'

export default class ArtisanTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
    ExitFaker.fake()

    await Config.loadAll(Path.stubs('config'))
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    ExitFaker.release()

    await Folder.safeRemove(Path.stubs('storage'))
  }

  @Test()
  public async shouldBeAbleToLoadArtisanApplicationDefaults({ assert }: TestContext) {
    await Artisan.load()

    assert.isTrue(ioc.hasDependency('Athenna/Core/View'))
    assert.isTrue(ioc.hasDependency('Athenna/Core/Artisan'))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationWithoutAnyOption({ assert }: TestContext) {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan'])

    assert.isTrue(ExitFaker.faker.called)
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterCommandsFromRoutes({ assert }: TestContext) {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterAConsoleKernel({ assert }: TestContext) {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
      kernelPath: Path.stubs('kernels/ConsoleKernel.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(CALLED_MAP.get(ConsoleKernel.name))
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  }

  @Test()
  public async shouldBeAbleToBootAnArtisanApplicationAndRegisterAConsoleExceptionHandler({ assert }: TestContext) {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
      exceptionHandlerPath: Path.stubs('handlers/ConsoleExceptionHandler.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(CALLED_MAP.get(ConsoleExceptionHandler.name))
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  }
}
