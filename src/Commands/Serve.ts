/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nodemon from 'nodemon'

import { Path } from '@secjs/utils'
import { Artisan, Command, Commander } from '@athenna/artisan'

export class Serve extends Command {
  /**
   * The name and signature of the console command.
   */
  protected signature = 'serve'

  /**
   * The console command description.
   */
  protected description = 'Serve the Athenna application.'

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @return {void}
   */
  public addFlags(commander: Commander): Commander {
    return commander.option(
      '-w, --watch',
      'Watch for file changes and re-start the HTTP server on change',
      false,
    )
  }

  /**
   * Execute the console command.
   *
   * @return {Promise<void>}
   */
  async handle(options: any): Promise<void> {
    process.env.BOOT_LOGS = 'true'

    await Artisan.call('build')

    if (options.watch) {
      const ignorePaths = `--ignore ${Path.tests()} ${Path.storage()} ${Path.pwd(
        'node_modules',
      )}`

      nodemon(
        `--quiet ${ignorePaths} --watch ${Path.pwd()} --exec 'node ${Path.pwd(
          'dist/bootstrap/main.js',
        )}' -e ts`,
      )

      return
    }

    await import(Path.pwd('dist/bootstrap/main.js'))
  }
}
