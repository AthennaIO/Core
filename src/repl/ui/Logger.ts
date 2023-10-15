/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Color } from '@athenna/common'

export class Logger {
  /**
   * Write a message to the stdout.
   */
  public static write(...args: any[]): void {
    process.stdout.write(args.join(' ') + '\n')
  }

  /**
   * Write a message to the stdout in red color.
   */
  public static red(...args: any[]): void {
    Logger.write(Color.red(args.join(' ')))
  }

  /**
   * Write a message to the stdout in gray color.
   */
  public static gray(...args: any[]): void {
    Logger.write(Color.gray(args.join(' ')))
  }

  /**
   * Write a message to the stdout in green color.
   */
  public static green(...args: any[]): void {
    Logger.write(Color.green(args.join(' ')))
  }

  /**
   * Write a message to the stdout in purple color.
   */
  public static purple(...args: any[]): void {
    Logger.write(Color.purple(args.join(' ')))
  }

  /**
   * Write a message to the stdout in yellow color.
   */
  public static yellow(...args: any[]): void {
    Logger.write(Color.yellow(args.join(' ')))
  }
}
