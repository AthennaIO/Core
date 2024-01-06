/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import figlet from 'figlet'
import chalkRainbow from 'chalk-rainbow'

import { debug } from '#src/debug'
import { Log } from '@athenna/logger'
import { Ls } from '#src/repl/commands/Ls'
import { Color, Is } from '@athenna/common'
import { Logger } from '#src/repl/ui/Logger'
import { Clean } from '#src/repl/commands/Clean'
import type { ReplImpl } from '#src/repl/ReplImpl'

export class Repl {
  /**
   * Boot the Repl application and session.
   */
  public static async boot(): Promise<ReplImpl> {
    const repl = ioc.safeUse<ReplImpl>('Athenna/Core/Repl')

    debug('booting repl application')

    await repl.start()

    repl.removeDomainErrorHandler().clean()

    Logger.write(chalkRainbow(figlet.textSync('REPL\n')))
    Logger.gray('To import your modules use dynamic imports:\n')
    Logger.gray("const { User } = await import('#app/models/User')\n")

    Logger.write(
      `${Color.yellow.bold('To see all commands available type:')} .help\n`
    )

    repl
      .setPrompt(Color.purple.bold('Athenna ') + Color.green.bold('❯ '))
      .displayPrompt(false)
      .shutdownProviders()
      .commandImpl(Ls)
      .commandImpl(Clean)

    return repl
  }

  /**
   * REPL error handler for errors that
   * happens inside the session.
   */
  public static handleError(error: any) {
    if (!Is.Exception(error)) {
      error = error.toAthennaException()
    }

    error.prettify().then(prettified => {
      Log.channelOrVanilla('exception').fatal(prettified)
      ioc.use('Athenna/Core/Repl').displayPrompt()
    })
  }
}
