/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const LEVEL = {
  boot: 'success',
  register: 'success',
  shutdown: 'warn',
}
export const MESSAGE = {
  boot: 'has been bootstrapped',
  register: 'has been registered',
  shutdown: 'is going down',
}

export const getDriver = method => {
  const DICTIONARY = {
    boot: 'null',
    register: 'null',
    shutdown: Env('SHUTDOWN_LOGS', false) ? 'console' : 'null',
  }

  return DICTIONARY[method]
}
