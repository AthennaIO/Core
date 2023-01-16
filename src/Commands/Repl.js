/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from '#src/index'
import { Logger } from '@athenna/logger'
import { Command } from '@athenna/artisan'

export class Repl extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'repl'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Start a new REPL session with Athenna loaded.'
  }

  /**
   * Set additional flags in the commander instance.
   * This method is executed when registering your command.
   *
   * @param {import('@athenna/artisan').Commander} commander
   * @return {import('@athenna/artisan').Commander}
   */
  addFlags(commander) {
    return commander.option(
      '-e, --env <env>',
      'Change the environment where the REPLSession will run. Default is ""',
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

    const application = await new Ignite().fire(import.meta.url, {
      bootLogs: false,
      shutdownLogs: false,
      uncaughtExceptionHandler: async error => {
        const logger = Logger.getVanillaLogger({
          driver: 'console',
          formatter: 'none',
        })

        if (!error.prettify) {
          error = error.toAthennaException()
        }

        logger.fatal(await error.prettify())

        repl.displayPrompt()
      },
    })

    const repl = await application.bootREPL()
  }
}
