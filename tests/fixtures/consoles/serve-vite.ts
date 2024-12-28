/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Mock } from '@athenna/test'
import { Path } from '@athenna/common'
import { ViewProvider } from '@athenna/view'
import { Rc, Config } from '@athenna/config'
import { LoggerProvider } from '@athenna/logger'
import { ServeCommand } from '#src/commands/ServeCommand'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new LoggerProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

await Rc.setFile(Path.pwd('package.json'))

Path.mergeDirs(Config.get('rc.directories', {}))

await new ConsoleKernel().registerCommands()

const vite = function () {
  return Mock.fake()
}

vite.loadConfigFromFile = function () {
  return { config: {} }
}

vite.mergeConfig = function () {
  return {}
}

vite.build = function () {
  return this
}

const vitePluginRestart = function () {
  return Mock.fake()
}

Mock.when(ServeCommand.prototype, 'getVite').return(vite)
Mock.when(ServeCommand.prototype, 'getVitePluginRestart').return(vitePluginRestart)

await Artisan.parse(process.argv)
