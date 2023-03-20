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
import { BaseTest } from '#tests/Helpers/BaseTest'
import { Artisan } from '#src/Applications/Artisan'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { Test, ExitFaker, TestContext } from '@athenna/test'
import { ConsoleKernel } from '#tests/Stubs/kernels/ConsoleKernel'
import { ConsoleExceptionHandler } from '#tests/Stubs/handlers/ConsoleExceptionHandler'

export default class ArtisanTest extends BaseTest {
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
  public async shouldBeAbleToLogThatTheConsoleKernelIsBootingIfRcBootLogsIsTrue({ assert }: TestContext) {
    Config.set('rc.bootLogs', true)

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(1)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    await Artisan.load()
    await Artisan.boot(['node', 'artisan'])

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(successFake.calledWith('Kernel ({yellow} ConsoleKernel) successfully booted'))
    mock.verify()
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
