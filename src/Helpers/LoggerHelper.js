/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
    if (Env('CORE_TESTING', false)) {
      return {
        write: m => null,
        red: m => null,
        gray: m => null,
        green: m => null,
        purple: m => null,
        yellow: m => null,
      }
    }

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
   * Get the logger with default driver and
   * formatter.
   *
   * @return {import('@athenna/logger').VanillaLogger}
   */
  static getLogger() {
    if (Env('CORE_TESTING', false)) {
      return Logger.getVanillaLogger({ driver: 'null' })
    }

    if (Env('BOOT_LOGS', true)) {
      return Logger.getVanillaLogger({ driver: 'console', formatter: 'simple' })
    }

    return Logger.getVanillaLogger({ driver: 'null' })
  }

  /**
   * Get the error logger with default driver and
   * formatter.
   *
   * @return {import('@athenna/logger').VanillaLogger}
   */
  static getErrorLogger() {
    if (Env('CORE_TESTING', false)) {
      return Logger.getVanillaLogger({ driver: 'null' })
    }

    return Logger.getVanillaLogger({ driver: 'console', formatter: 'none' })
  }

  /**
   * Get the logger for provider helper
   * method.
   *
   * @param method {string}
   * @return {import('@athenna/logger').VanillaLogger}
   */
  static getProviderHelperLogger(method) {
    const DICTIONARY = {
      boot: 'null',
      register: 'null',
      shutdown: Env('SHUTDOWN_LOGS', false) ? 'console' : 'null',
    }

    return Logger.getVanillaLogger({
      driver: DICTIONARY[method],
      formatter: 'simple',
    })
  }
}
