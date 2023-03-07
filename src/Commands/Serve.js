/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Command } from '@athenna/artisan'
import { Module, Path } from '@athenna/common'

export class Serve extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'serve'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Serve the Athenna application.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('@athenna/artisan').Commander} commander
   * @return {import('@athenna/artisan').Commander}
   */
  addFlags(commander) {
    return commander
      .option(
        '-w, --watch',
        'Watch for file changes and re-start the application on change',
        false,
      )
      .option(
        '-e, --env <env>',
        'Change the environment where the application will run. Default is ""',
        '',
      )
  }

  /**
   * Execute the console command.
   *
   * @params {any} options
   * @return {Promise<void>}
   */
  async handle(options) {
    if (options.env !== '') {
      process.env.NODE_ENV = options.env
    }

    if (options.watch) {
      let execCmd = "'npm run start --silent'"
      const nodemon = await import('nodemon')
      const ignorePaths = `--ignore ${Path.tests()} ${Path.storage()} ${Path.nodeModules()}`

      if (Env('NODEMON_NPM_ARGS', '') !== '') {
        execCmd = execCmd.concat(' ', Env('NODEMON_NPM_ARGS'))
      }

      nodemon.default(
        `--quiet ${ignorePaths} --watch ${Path.pwd()} --exec ${execCmd}`,
      )

      return
    }

    await Module.import(Path.bootstrap(`main.${Path.ext()}`))
  }
}
