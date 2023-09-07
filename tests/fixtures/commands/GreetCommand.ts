/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BaseCommand, Argument } from '@athenna/artisan'

export class GreetCommand extends BaseCommand {
  @Argument()
  public name: string

  public static signature(): string {
    return 'greet'
  }

  public async handle(): Promise<void> {
    this.logger.simple(`({bold,green} [ HELLO ${this.name.toUpperCase()}! ])\n`)
  }
}
