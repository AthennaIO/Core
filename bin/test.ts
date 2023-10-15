/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { request } from '@athenna/http/testing/plugins'
import { command } from '@athenna/artisan/testing/plugins'
import { Runner, assert, specReporter } from '@athenna/test'

if (process.argv.includes('--cmd')) {
  console.log(process.argv)
  console.log('Hello from #bin/test!')
  console.log(process.env.APP_ENV)
  console.log(process.env.NODE_ENV)
  process.exit(0)
}

await Runner.setTsEnv()
  .addPlugin(assert())
  .addPlugin(request())
  .addPlugin(command())
  .addReporter(specReporter())
  .addPath('tests/unit/**/*.ts')
  .setCliArgs(process.argv.slice(2))
  .setGlobalTimeout(30000)
  .run()
