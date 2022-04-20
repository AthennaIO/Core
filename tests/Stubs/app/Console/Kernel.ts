/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ConsoleKernel } from '@athenna/artisan'

export class Kernel extends ConsoleKernel {
  /**
   * Register the commands for the application.
   *
   * @return void
   */
  protected commands = [
    import('@athenna/artisan/src/Commands/Make/Eslint'),
    import('@athenna/artisan/src/Commands/Make/Facade'),
    import('@athenna/artisan/src/Commands/Make/Command'),
    import('@athenna/artisan/src/Commands/Make/Service'),
    import('@athenna/artisan/src/Commands/Make/Provider'),
    import('@athenna/artisan/src/Commands/Make/Controller'),
    import('@athenna/artisan/src/Commands/Make/Middleware'),
  ]
}
