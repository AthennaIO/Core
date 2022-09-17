/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CoreLoader } from '#src/index'
import { HttpLoader } from '@athenna/http'
import { ArtisanLoader, ConsoleKernel } from '@athenna/artisan'

export class Kernel extends ConsoleKernel {
  /**
   * Register the commands for the application.
   *
   * @return {any[]}
   */
  get commands() {
    return [...ArtisanLoader.loadCommands(), ...HttpLoader.loadCommands(), ...CoreLoader.loadCommands()]
  }

  /**
   * Register custom templates files.
   *
   * @return {any[]}
   */
  get templates() {
    return [...HttpLoader.loadTemplates(), ...ArtisanLoader.loadTemplates()]
  }
}
