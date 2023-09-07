/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'

Artisan.route('test:generate', async function () {
  await this.generator.path(Path.fixtures('storage/Command.ts')).template('command').make()
})
  .description('hello')
  .showHelpAfterError()
