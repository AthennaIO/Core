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

export class ReplCommand extends BaseCommand {
  @Option({
    signature: '-e, --env <env>',
    description: 'Change the evironment where the application will run.',
    default: '',
  })
  public env: string

  public static signature(): string {
    return 'repl'
  }

  public static description(): string {
    return 'Start a new REPL session with Athenna application loaded.'
  }

  // TODO Verify if this command still makes sense to exist.
  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    const entrypoint = Config.get(
      'rc.commands.repl.entrypoint',
      '#bootstrap/repl',
    )

    await Module.resolve(entrypoint, Config.get('rc.meta'))
  }
}
