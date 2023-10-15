/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { REPLServer } from 'node:repl'

export abstract class Command {
  /**
   * The command signature that will be used for calling
   * the command.
   */
  public static signature(): string {
    return ''
  }

  /**
   * The command help description that will be displayed.
   */
  public static help(): string {
    return ''
  }

  /**
   * The action to be executed when the command is called.
   */
  public static action(this: REPLServer, _?: string): void {}
}
