/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { URL } from 'node:url'
import { Config, Rc } from '@athenna/config'
import { ViewProvider } from '@athenna/view'
import { LoggerProvider } from '@athenna/logger'
import { File, Folder } from '@athenna/common'
import { AfterEach, BeforeEach, ExitFaker } from '@athenna/test'
import { ArtisanProvider, CommanderHandler, ConsoleKernel } from '@athenna/artisan'

export class BaseCommandTest {
  public artisan = Path.fixtures('artisan.ts')
  public originalPJson = new File(Path.pwd('package.json')).getContentAsStringSync()

  @BeforeEach()
  public async beforeEach() {
    ExitFaker.fake()

    await Config.loadAll(Path.fixtures('config'))

    Config.set('meta', new URL('../../bin/test.ts', import.meta.url).href)

    new ViewProvider().register()
    new LoggerProvider().register()
    new ArtisanProvider().register()

    const kernel = new ConsoleKernel()

    await Rc.setFile(Path.pwd('package.json'))

    await kernel.registerExceptionHandler()
    await kernel.registerCommands()
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    ioc.reconstruct()
    ExitFaker.release()

    CommanderHandler.getCommander<any>()._events = {}
    CommanderHandler.getCommander<any>().commands = []
    CommanderHandler.getCommander<any>()._version = undefined

    await Folder.safeRemove(Path.app())
    await Folder.safeRemove(Path.config())
    await Folder.safeRemove(Path.providers())
    await Folder.safeRemove(Path.resources())
    await Folder.safeRemove(Path.tests('e2e'))

    await File.safeRemove(Path.pwd('.env'))
    await File.safeRemove(Path.pwd('.env.test'))
    await File.safeRemove(Path.pwd('.env.example'))
    await File.safeRemove(Path.pwd('docker-compose.yml'))
    await File.safeRemove(Path.tests('unit/TestTest.ts'))
    await Folder.safeRemove(Path.fixtures('storage'))
    await Folder.safeRemove(Path.fixtures('build'))
    await Folder.safeRemove(Path.pwd('tmp'))

    await new File(Path.pwd('package.json')).setContent(this.originalPJson)
  }
}
