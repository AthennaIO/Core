/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { BaseCommand, Option } from '@athenna/artisan'

export class ServeCommand extends BaseCommand {
  @Option({
    signature: '-e, --env <env>',
    description: 'Change the environment where the application will run.',
    default: ''
  })
  public env: string

  public static signature(): string {
    return 'serve'
  }

  public static description(): string {
    return 'Serve your application.'
  }

  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    const entrypoint = Config.get(
      'rc.commands.serve.entrypoint',
      Path.bootstrap(`main.${Path.ext()}`)
    )

    await Module.resolve(entrypoint, Config.get('rc.meta'))
  }
}
