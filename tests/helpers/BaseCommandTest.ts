/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Folder } from '@athenna/common'
import { ArtisanProvider } from '@athenna/artisan'
import { BeforeEach, AfterEach, Mock } from '@athenna/test'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseCommandTest {
  public originalPJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    new ArtisanProvider().register()

    TestCommand.setArtisanPath(Path.fixtures('consoles/base-console.ts'))
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    ioc.reconstruct()

    await File.safeRemove(Path.tests('unit/TestTest.ts'))

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.providers())
    await Folder.safeRemove(Path.storage())
    await Folder.safeRemove(Path.pwd('dist'))
    await Folder.safeRemove(Path.pwd('build'))
    await Folder.safeRemove(Path.pwd('build-relative'))
    await Folder.safeRemove(Path.tests('e2e'))

    await new File(Path.pwd('package.json')).setContent(this.originalPJson)
  }
}
