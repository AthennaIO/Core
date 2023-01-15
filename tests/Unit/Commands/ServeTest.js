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
import { File, Folder, Path } from '@athenna/common'

import { Artisan } from '@athenna/artisan'
import { Kernel } from '#tests/Stubs/app/Console/Kernel'
import { LoggerProvider } from '@athenna/logger/providers/LoggerProvider'
import { ArtisanProvider } from '@athenna/artisan/providers/ArtisanProvider'
import { TemplateProvider } from '@athenna/artisan/providers/TemplateProvider'

test.group('ServeTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())
    await new Folder(Path.stubs('bootstrap')).copy(Path.bootstrap())
    await new File(Path.stubs('artisan.js')).copy(Path.pwd('artisan.js'))

    await Config.safeLoad(Path.config('app.js'))
    await Config.safeLoad(Path.config('logging.js'))

    new LoggerProvider().register()
    new ArtisanProvider().register()
    new TemplateProvider().register()

    const kernel = new Kernel()

    await kernel.registerErrorHandler()
    await kernel.registerCommands()
    await kernel.registerTemplates()
  })

  group.each.teardown(async () => {
    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.bootstrap())
    await File.safeRemove(Path.pwd('artisan.js'))
  })

  test('should be able to serve an athenna application importing the bootstrap file in serve command', async ({
    assert,
  }) => {
    const { stdout } = await Artisan.callInChild('serve')

    assert.isTrue(stdout.includes('serving application!'))
  }).timeout(60000)
})
