/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class InstallCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToInstallLibrariesAndRunConfigurerIfItExists({ command }: Context) {
    const output = await command.run('install semver')

    output.assertSucceeded()
  }

  @Test()
  public async shouldBeAbleToInstallLibrariesInDevModeAndRunConfigurerIfItExists({ command }: Context) {
    const output = await command.run('install @athenna/tsconfig -D')

    output.assertSucceeded()
  }
}
