/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoggerProvider } from '@athenna/logger'
import { ArtisanProvider } from '@athenna/artisan'
import { Path, File, Folder } from '@athenna/common'
import { BeforeEach, AfterEach, Mock } from '@athenna/test'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseCommandTest {
  public originalPJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    new LoggerProvider().register()
    new ArtisanProvider().register()

    TestCommand.setArtisanPath(Path.fixtures('consoles/base-console.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()

    await File.safeRemove(Path.tests('unit/TestTest.ts'))
    await File.safeRemove(Path.facades('TestFacade.ts'))
    await File.safeRemove(Path.providers('TestProvider.ts'))
    await File.safeRemove(Path.exceptions('TestException.ts'))

    await Folder.safeRemove(Path.services())
    await Folder.safeRemove(Path.fixtures('storage'))
    await Folder.safeRemove(Path.pwd('dist'))
    await Folder.safeRemove(Path.pwd('build'))
    await Folder.safeRemove(Path.pwd('build-relative'))
    await Folder.safeRemove(Path.tests('e2e'))

    await new File(Path.pwd('package.json')).setContent(this.originalPJson)
  }
}
