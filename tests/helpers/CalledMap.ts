/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export const CALLED_MAP = new Map<string, boolean>()

CALLED_MAP.set('HttpKernel', false)
CALLED_MAP.set('ConsoleKernel', false)
CALLED_MAP.set('HttpExceptionHandler', false)
CALLED_MAP.set('ConsoleExceptionHandler', false)
