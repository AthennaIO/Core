/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeExceptionCommand extends BaseCommand {
  @Argument({
    description: 'The exception name.'
  })
  public name: string

  public static signature(): string {
    return 'make:exception'
  }

  public static description(): string {
    return 'Make a new exception file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING EXCEPTION ])\n')

    const destination = Config.get(
      'rc.commands.make:exception.destination',
      Path.exceptions()
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('exception')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Exception ({yellow} "${file.name}") successfully created.`
    )
  }
}
