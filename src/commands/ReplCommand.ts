/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, Module } from '@athenna/common'
import { BaseCommand } from '@athenna/artisan'

export class ReplCommand extends BaseCommand {
  public static signature(): string {
    return 'repl'
  }

  public static description(): string {
    return 'Start a new REPL session with Athenna application loaded.'
  }

  public async handle(): Promise<void> {
    const entrypoint = Config.get(
      'rc.commands.repl.entrypoint',
      Path.bootstrap(`repl.${Path.ext()}`)
    )

    await Module.resolve(entrypoint, Config.get('rc.parentURL'))
  }
}
