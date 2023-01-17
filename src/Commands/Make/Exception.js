/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Command } from '@athenna/artisan'

export class MakeException extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'make:exception <name>'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Make a new exception file.'
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
      '--no-lint',
      'Do not run eslint in the exception.',
      true,
    )
  }

  /**
   * Execute the console command.
   *
   * @param {string} name
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(name, options) {
    const resource = 'Exception'
    const path = Path.app(`Exceptions/${name}.${Path.ext()}`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    const file = await this.makeFile(path, 'exception', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)
  }
}