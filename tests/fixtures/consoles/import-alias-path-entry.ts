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
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ViewProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.commands.repl.entrypoint', '#tests/fixtures/entrypoints/repl')
Config.set('rc.commands.serve.entrypoint', '#tests/fixtures/entrypoints/main')
Config.set('rc.commands.test.entrypoint', '#tests/fixtures/entrypoints/test')

await Rc.setFile(Path.pwd('package.json'))

Path.mergeDirs(Config.get('rc.directories', {}))

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
