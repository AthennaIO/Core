/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color } from '@athenna/common'
import type { REPLServer } from 'node:repl'
import { Logger } from '#src/repl/ui/Logger'
import { Command } from '#src/repl/helpers/Command'
import { INTERNAL_REPL_PROPS } from '#src/constants/InternalReplProps'

export class Ls extends Command {
  public static signature(): string {
    return 'ls'
  }

  public static help(): string {
    return 'List all Athenna preloaded methods/properties in REPL context and some of the Node.js globals.'
  }

  public static action(this: REPLServer): void {
    this.clearBufferedCommand()

    const nodeInternals = []
    const athennaInternals = []

    Object.keys(this.context).forEach(key => {
      if (key.startsWith('__')) {
        return
      }

      if (INTERNAL_REPL_PROPS.includes(key)) {
        nodeInternals.push(Color.yellow(` - ${key}`))
        return
      }

      athennaInternals.push(Color.yellow(` - ${key}`))
    })

    if (nodeInternals.length) {
      Logger.write(
        `${Color.green.bold('\nFROM NODE:')}\n\n${nodeInternals.join('\n')}`
      )
    }

    if (athennaInternals.length) {
      Logger.write(
        `${Color.purple.bold('\nFROM ATHENNA:')}\n\n${athennaInternals.join(
          '\n'
        )}`
      )
    }

    Logger.write('')

    this.displayPrompt()
  }
}
