/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import nodemon from 'nodemon'
import tsConfigPaths from 'tsconfig-paths'

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
    const tsConfig = await import(Path.noBuild().pwd('tsconfig.json'))
    const tsConfigCore = await import('../../_tsconfig.json')

    tsConfigPaths.register({
      baseUrl: './dist',
      paths: {
        ...tsConfigCore.default.compilerOptions.paths,
        ...tsConfig.compilerOptions.paths,
      },
    })

    Path.switchEnvVerify()

    if (options.watch) {
      nodemon(
        `--quiet --ignore tests storage node_modules --watch '.' --exec 'ts-node ${Path.pwd(
          'bootstrap/main.ts',
        )}' -e ts`,
      )

      return
    }

    await Artisan.call('build')

    await import(Path.pwd('dist/bootstrap/main.js'))
  }
}
