/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan, ConsoleKernel, ArtisanProvider } from '@athenna/artisan'

new ArtisanProvider().register()

await Config.loadAll(Path.fixtures('config'))

Config.set('rc.commands.build.tsconfig', './tests/fixtures/tsconfig.build.json')
Config.set('rc.commands.build.outDir', 'build-relative')

await new ConsoleKernel().registerCommands()

await Artisan.parse(process.argv)
