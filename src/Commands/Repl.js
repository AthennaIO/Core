/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Command } from '@athenna/artisan'

import { Ignite } from '#src/index'

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
   * Execute the console command.
   *
   * @params {any} options
   * @return {Promise<void>}
   */
  async handle() {
    process.env.BOOT_LOGS = 'false'

    const application = await new Ignite().fire()

    if (ioc.hasDependency('Athenna/Core/Database')) {
      await ioc.use('Athenna/Core/Database').connect()
    }

    await application.bootREPL()
  }
}
