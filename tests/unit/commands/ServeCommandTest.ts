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

export default class ServeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToExecuteServeCommand({ command }: Context) {
    const output = await command.run('serve')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandWithADifferentEnv({ command }: Context) {
    const output = await command.run('serve --env=test-hello')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/main!')
    output.assertLogged('test-hello\ntest-hello')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingAImportAliasPathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/import-alias-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingAnAbsolutePathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/absolute-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }

  @Test()
  public async shouldBeAbleToExecuteServeCommandUsingARelativePathEntry({ command }: Context) {
    const output = await command.run('serve', {
      path: Path.fixtures('consoles/relative-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/main!')
  }
}
