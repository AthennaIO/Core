/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { LoggerProvider } from '@athenna/logger'
import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new LoggerProvider().register()
new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.commands.build.include', ['.env'])

Path.mergeDirs(Config.get('rc.directories', {}))

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
