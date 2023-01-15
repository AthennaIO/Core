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

test.group('MakeRepositoryTest', group => {
  group.each.setup(async () => {
    await new Folder(Path.stubs('app')).copy(Path.app())
    await new Folder(Path.stubs('config')).copy(Path.config())

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
  })

  test('should be able to create a service file', async ({ assert }) => {
    await Artisan.call('make:service TestRepository')

    const path = Path.services('TestRepository.js')

    assert.isTrue(await File.exists(path))
  }).timeout(60000)

  test('should throw an error when the file already exists', async ({ assert }) => {
    await Artisan.call('make:service TestRepository')
    await Artisan.call('make:service TestRepository')
  }).timeout(60000)
})
