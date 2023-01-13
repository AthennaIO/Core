/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Env } from '@athenna/config'
import { ColorHelper, Logger } from '@athenna/logger'

export class LoggerHelper {
  /**
   * Return repl log object.
   *
   * @return {{
   *    red: (m: string) => any,
   *    gray: (m: string) => any,
   *    green: (m: string) => any,
   *    yellow: (m: string) => any,
   *    purple: (m: string) => any,
   *    write: (m: string) => any
   * }}
   */
  static get replLog() {
    return {
      write: m => process.stdout.write(m + '\n'),
      red: m => process.stdout.write(this.replUi.red(m + '\n')),
      gray: m => process.stdout.write(this.replUi.gray(m + '\n')),
      green: m => process.stdout.write(this.replUi.green(m + '\n')),
      purple: m => process.stdout.write(this.replUi.purple(m + '\n')),
      yellow: m => process.stdout.write(this.replUi.yellow(m + '\n')),
    }
  }

  /**
   * Return repl ui kit object.
   *
   * @return {{
   *    red: import('chalk').ChalkInstance,
   *    gray: import('chalk').ChalkInstance,
   *    green: import('chalk').ChalkInstance,
   *    yellow: import('chalk').ChalkInstance,
   *    purple: import('chalk').ChalkInstance,
   *    pure: import('chalk').ChalkInstance
   * }}
   */
  static get replUi() {
    return {
      pure: ColorHelper.chalk,
      red: ColorHelper.chalk.red,
      gray: ColorHelper.chalk.gray,
      green: ColorHelper.chalk.green,
      purple: ColorHelper.purple,
      yellow: ColorHelper.chalk.yellow,
    }
  }

  /**
   * Create a new instance of logger based in NODE_ENV
   * and BOOT_LOGS envs.
   *
   * @return {Logger}
   */
  static get() {
    const logger = new Logger()

    return Env('NODE_ENV') === 'test' || !Env('BOOT_LOGS')
      ? logger.channel('discard')
      : logger.channel('application')
  }

  /**
   * Create a console logger using console log to
   * log exceptions.
   *
   * @return {{
   *  warn: ((...m: any[]) => void),
   *  trace: ((...m: any[]) => void),
   *  debug: ((...m: any[]) => void),
   *  success: ((...m: any[]) => void),
   *  error: ((...m: any[]) => void),
   *  info: ((...m: any[]) => void),
   *  fatal: ((...m: any[]) => void)
   *  }}
   */
  static getConsoleLogger() {
    return {
      info: (...m) => console.log(...m),
      warn: (...m) => console.log(...m),
      error: (...m) => console.error(...m),
      debug: (...m) => console.log(...m),
      trace: (...m) => console.log(...m),
      fatal: (...m) => console.error(...m),
      success: (...m) => console.log(...m),
    }
  }
}
