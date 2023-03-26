/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@athenna/config'
import { Path, File } from '@athenna/common'

const athennaRc = new File(Path.pwd('package.json')).getContentAsJsonSync().athenna

athennaRc.isInPackageJson = true
athennaRc.meta = Config.get('meta', 'file:///Users/jlenon7/Development/Athenna/Core/bin/test.ts')

export default athennaRc
