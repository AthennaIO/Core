/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Folder, Path } from '@secjs/utils'
import { HttpCommandsLoader } from '@athenna/http'
import { ArtisanLoader, ConsoleKernel } from '@athenna/artisan'

export class Kernel extends ConsoleKernel {
  /**
   * Register the commands for the application.
   *
   * @return {any[]}
   */
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...HttpCommandsLoader.loadCommands()]
  }

  /**
   * Register custom templates files.
   *
   * @return {import('@secjs/utils').File[] | Promise<any[]>}
   */
  get templates() {
    return [...new Folder(Path.nodeModules('@athenna/http/templates')).loadSync().files]
  }
}
