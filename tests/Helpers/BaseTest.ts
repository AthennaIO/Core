/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoadHelper } from '#src'
import { File, Folder, Json } from '@athenna/common'
import { Log, LoggerProvider } from '@athenna/logger'
import { ExitFaker, BeforeEach, AfterEach } from '@athenna/test'
import { HttpRouteProvider, HttpServerProvider } from '@athenna/http'
import { CALLED_MAP } from './CalledMap.js'

export class BaseTest {
  public originalEnv = Json.copy(process.env)
  public originalKill = Json.copy(process.kill)
  public originalPJson = new File(Path.pwd('package.json')).getContentAsJsonSync()

  @BeforeEach()
  public async beforeEach() {
    ExitFaker.fake()

    process.env.IS_TS = 'true'
    process.env.CORE_TESTING = 'true'
    process.env.ARTISAN_TESTING = 'true'

    await Config.loadAll(Path.stubs('config'))

    Config.set('meta', 'file:///Users/jlenon7/Development/Athenna/Core/bin/test.ts')

    await new LoggerProvider().register()
    await new HttpRouteProvider().register()
    await new HttpServerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Log.getMock().restore()
    Log.restoreAllMethods()
    await new LoggerProvider().shutdown()
    await new HttpRouteProvider().shutdown()
    await new HttpServerProvider().shutdown()

    Config.clear()
    CALLED_MAP.clear()
    ioc.reconstruct()
    ExitFaker.release()
    LoadHelper.providers = []
    LoadHelper.alreadyPreloaded = []
    Path.defaultBeforePath = ''
    process.kill = this.originalKill
    process.env = Json.copy(this.originalEnv)

    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')

    await File.safeRemove(Path.pwd('.env'))
    await File.safeRemove(Path.pwd('.env.local'))
    await Folder.safeRemove(Path.stubs('storage'))

    await new File(Path.pwd('package.json')).setContent(JSON.stringify(this.originalPJson, null, 2).concat('\n'))
  }
}
