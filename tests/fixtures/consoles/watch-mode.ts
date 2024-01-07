/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Mock } from '@athenna/test'
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

const fn = function () {
  return Mock.fake()
}

fn.on = function () {
  return this
}

Mock.when(ServeCommand.prototype, 'getNodemon').return(fn)

await Artisan.parse(process.argv)
