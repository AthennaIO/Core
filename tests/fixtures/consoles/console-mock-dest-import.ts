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

Config.set('rc.commands.make:exception.destination', './tests/fixtures/storage/exceptions')
Config.set('rc.commands.make:facade.destination', './tests/fixtures/storage/facades')
Config.set('rc.commands.make:provider.destination', './tests/fixtures/storage/providers')
Config.set('rc.commands.make:service.destination', './tests/fixtures/storage/services')
Config.set('rc.commands.make:test.destination', './tests/fixtures/storage/tests')

await Rc.setFile(Path.pwd('package.json'))

Path.mergeDirs(Config.get('rc.directories', {}))

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
