/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { BaseCommand, CommandSettings, Option } from '@athenna/artisan'

export class ReplCommand extends BaseCommand {
  @Option({
    signature: '-e, --env <env>',
    description:
      'Change the evironment where the application will run. Default is ""',
    default: '',
  })
  public env: string

  public static settings(): CommandSettings {
    return {
      stayAlive: true,
    }
  }

  public static signature(): string {
    return 'repl'
  }

  public static description(): string {
    return 'Start a new REPL session with Athenna application loaded.'
  }

  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    await Module.resolve(
      Config.get('rc.commandsPaths.repl', '#bootstrap/repl'),
      Config.get('rc.meta'),
    )
  }
}
