/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { assert } from '@japa/assert'
import { Config } from '@athenna/config'
import { pathToFileURL } from 'node:url'
import { specReporter } from '@japa/spec-reporter'
import { configure, processCliArgs, run } from '@japa/runner'

/*
|--------------------------------------------------------------------------
| Japa types
|--------------------------------------------------------------------------
|
| Declare customized japa types.
*/

declare module '@japa/assert' {
  export interface Assert {
    throws(fn: () => any, errType: any, message?: string): void
    doesNotThrows(fn: () => any, errType: any, message?: string): void
    rejects(
      fn: () => any | Promise<any>,
      errType: any,
      message?: string,
    ): Promise<any>
    doesNotRejects(
      fn: () => any | Promise<any>,
      errType: any,
      message?: string,
    ): Promise<any>
  }
}

declare module '@japa/runner' {
  interface TestContext {
    assert: import('@japa/assert').Assert
  }
}

/*
|--------------------------------------------------------------------------
| Set IS_TS env.
|--------------------------------------------------------------------------
|
| Set the IS_TS environement variable to true. Very useful when using the
| Path helper.
*/

process.env.IS_TS = 'true'

Config.set('meta', import.meta.url)

/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*Test.ts'],
    plugins: [assert()],
    reporters: [specReporter()],
    importer: filePath => import(pathToFileURL(filePath).href),
    timeout: 10000,
  },
})

/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/

run()
