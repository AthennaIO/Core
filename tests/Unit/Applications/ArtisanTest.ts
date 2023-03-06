/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Config } from '@athenna/config'
import { LoggerProvider } from '@athenna/logger'
import { Artisan } from '#src/Applications/Artisan'
import { ExitFaker } from '#tests/Helpers/ExitFaker'
import { File, Folder, Path } from '@athenna/common'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
import { ConsoleKernel } from '#tests/Stubs/kernels/ConsoleKernel'
import { ConsoleExceptionHandler } from '#tests/Stubs/handlers/ConsoleExceptionHandler'

test.group('ArtisanTest', group => {
  group.each.setup(async () => {
    ioc.reconstruct()
    ExitFaker.fake()

    await Config.loadAll(Path.stubs('config'))
    new LoggerProvider().register()
  })

  group.each.teardown(async () => {
    ExitFaker.release()

    await Folder.safeRemove(Path.stubs('storage'))
  })

  test('should be able to load artisan application defaults', async ({ assert }) => {
    await Artisan.load()

    assert.isTrue(ioc.hasDependency('Athenna/Core/View'))
    assert.isTrue(ioc.hasDependency('Athenna/Core/Artisan'))
  })

  test('should be able to boot an artisan application without any option', async ({ assert }) => {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan'], { displayName: null }) // <- Only for tests

    assert.isTrue(ExitFaker.faker.called)
  })

  test('should be able to boot an artisan application and register commands from routes', async ({ assert }) => {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  })

  test('should be able to boot an artisan application and register a different console kernel', async ({ assert }) => {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
      kernelPath: Path.stubs('kernels/ConsoleKernel.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(CALLED_MAP.get(ConsoleKernel.name))
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  })

  test('should be able to boot an artisan application and register a different exception handler', async ({
    assert,
  }) => {
    await Artisan.load()
    await Artisan.boot(['node', 'artisan', 'test:generate'], {
      displayName: null,
      routePath: Path.stubs('routes/console.ts'),
      kernelPath: Path.stubs('kernels/ConsoleKernel.ts'),
      exceptionHandlerPath: Path.stubs('handlers/ConsoleExceptionHandler.ts'),
    })

    assert.isTrue(ExitFaker.faker.called)
    assert.isTrue(CALLED_MAP.get(ConsoleKernel.name))
    assert.isTrue(CALLED_MAP.get(ConsoleExceptionHandler.name))
    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  })
})
