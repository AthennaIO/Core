/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ViewProvider } from '@athenna/view'
import { Rc, Config } from '@athenna/config'
import { LoggerProvider } from '@athenna/logger'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new LoggerProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.commands.repl.entrypoint', Path.fixtures('entrypoints/repl.ts'))
Config.set('rc.commands.serve.entrypoint', Path.fixtures('entrypoints/main.ts'))
Config.set('rc.commands.test.entrypoint', Path.fixtures('entrypoints/test.ts'))
Path.mergeDirs(Config.get('rc.directories', {}))
await Rc.setFile(Path.pwd('package.json'))

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
