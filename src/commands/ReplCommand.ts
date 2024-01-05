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
  @Option({ isFromGlobal: true, signature: '--env <env>' })
  public env: string

  public static signature(): string {
    return 'repl'
  }

  public static description(): string {
    return 'Start a new REPL session with Athenna application loaded.'
  }

  public async handle(): Promise<void> {
    process.env.APP_ENV = this.env
    process.env.NODE_ENV = this.env

    const entrypoint = Config.get(
      'rc.commands.repl.entrypoint',
      Path.bootstrap(`repl.${Path.ext()}`)
    )

    await Module.resolve(entrypoint, Config.get('rc.parentURL'))
  }
}
