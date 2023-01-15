/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { Artisan, Command, FilePropertiesHelper } from '@athenna/artisan'

export class MakeProvider extends Command {
  /**
   * The name and signature of the console command.
   *
   * @return {string}
   */
  get signature() {
    return 'make:provider <name>'
  }

  /**
   * The console command description.
   *
   * @return {string}
   */
  get description() {
    return 'Make a new provider file.'
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
        '--no-register',
        'Do not register the provider inside config/app file.',
        true,
      )
      .option('--no-lint', 'Do not run eslint in the provider.', true)
  }

  /**
   * Execute the console command.
   *
   * @param {string} name
   * @param {any} options
   * @return {Promise<void>}
   */
  async handle(name, options) {
    const resource = 'Provider'
    const path = Path.providers(`${name}.${Path.ext()}`)

    this.title(`MAKING ${resource}\n`, 'bold', 'green')

    const file = await this.makeFile(path, 'provider', options.lint)

    this.success(`${resource} ({yellow} "${file.name}") successfully created.`)

    if (options.register) {
      const path = Path.config(`app.${Path.ext()}`)

      await FilePropertiesHelper.addContentToArrayProperty(
        path,
        'providers: ',
        `import('#providers/${name}')`,
      )

      await Artisan.call(`eslint:fix ${path} --quiet`)
    }
  }
}
