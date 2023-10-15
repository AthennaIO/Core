/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { REPLServer } from 'node:repl'
import { Color } from '@athenna/common'
import { Logger } from '#src/repl/ui/Logger'
import { Command } from '#src/repl/helpers/Command'

export class Clean extends Command {
  public static signature(): string {
    return 'clean'
  }

  public static help(): string {
    return `Clean any property of REPL global context. Example: .clean ${Color.gray(
      '(propertyName)'
    )}`
  }

  public static action(this: REPLServer, property: string) {
    this.clearBufferedCommand()

    Logger.write('')

    if (!property) {
      Logger.red('You have not provided any property to remove.\n')
      Logger.write(`Try like this: .clean ${Color.gray('(propertyName)')}\n`)

      this.displayPrompt()

      return
    }

    if (!this.context[property]) {
      Logger.red(
        `The property "${property}" doesn't exist inside REPL context.\n`
      )
      Logger.write(
        `Use the ${Color.gray(
          '.ls'
        )} command to check the properties available\n`
      )

      this.displayPrompt()

      return
    }

    delete this.context[property]

    Logger.green(
      `Property "${property}" successfully removed from REPL context.\n`
    )

    this.displayPrompt()
  }
}
