/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger as AthennaLogger } from '@athenna/logger'

/**
 * Mocking the Logger to not show Athenna logs in test environment
 */
export const Logger: () => AthennaLogger = () => {
  return Env('NODE_ENV') === 'test' || Env('BOOT_LOGS') === 'false'
    ? ({
        channel: (_channel: string, _runtimeConfig?: any) => {},
        log: (_message: any, _options: any = {}) => {},
        info: (_message: any, _options: any = {}) => {},
        warn: (_message: any, _options: any = {}) => {},
        error: (_message: any, _options: any = {}) => {},
        debug: (_message: any, _options: any = {}) => {},
        success: (_message: any, _options: any = {}) => {},
      } as AthennaLogger)
    : new AthennaLogger()
}
