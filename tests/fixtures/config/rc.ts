/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { sep } from 'node:path'
import { Path, File } from '@athenna/common'

const athennaRc = new File(Path.pwd('package.json')).getContentAsJsonSync().athenna

athennaRc.parentURL = Path.toHref(Path.pwd() + sep)

export default athennaRc
