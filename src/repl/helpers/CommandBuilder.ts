/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { PrettyREPLServer } from 'pretty-repl'
import type { REPLCommand, REPLCommandAction } from 'node:repl'

export class CommandBuilder {
  /**
   * Holds the command options.
   */
  private options: Partial<REPLCommand>

  /**
   * Holds the repl session.
   */
  private session: PrettyREPLServer

  /**
   * Holds the command signature.
   */
  private signature: string

  public constructor(signature: string, session: PrettyREPLServer) {
    this.signature = signature
    this.session = session
    this.options = {}
  }

  /**
   * Set the command help that will be displayed when running
   * the .help command.
   */
  public help(help: string): CommandBuilder {
    this.options.help = help

    return this
  }

  /**
   * Set the command action that will be executed when running
   * the command.
   */
  public action(action: REPLCommandAction): CommandBuilder {
    this.options.action = action

    return this
  }

  /**
   * Register the command in the repl session.
   */
  public register(): void {
    this.session.defineCommand(this.signature, this.options as REPLCommand)
  }
}
