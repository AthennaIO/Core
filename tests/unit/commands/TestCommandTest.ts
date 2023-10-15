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

export default class TestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToExecuteTestCommand({ command }: Context) {
    const output = await command.run('test --cmd')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/test!')
  }

  @Test()
  public async shouldBeAbleToExecuteTestCommandWithADifferentEnv({ command }: Context) {
    const output = await command.run('test --cmd --env=test-hello')

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/test!')
    output.assertLogged('test-hello\ntest-hello')
  }

  @Test()
  public async shouldBeAbleToExecuteTestCommandAndSetJapaArgs({ command }: Context) {
    const output = await command.run(
      'test ' +
        '--cmd ' +
        '--tests="hello" ' +
        '--groups="TestCommandTest" ' +
        '--files="./tests/unit/commands/TestCommandTest.ts" ' +
        '--tags="unit" --force-exit --timeout="3000"'
    )

    output.assertSucceeded()
    output.assertLogged('Hello from #bin/test!')
    output.assertLogged('--tests="hello"')
    output.assertLogged('--groups="TestCommandTest"')
    output.assertLogged('--tags="unit"')
    output.assertLogged('--force-exit')
    output.assertLogged('--timeout="3000"')
    output.assertLogged('--files="./tests/unit/commands/TestCommandTest.ts"')
  }

  @Test()
  public async shouldBeAbleToExecuteTestCommandUsingAImportAliasPathEntry({ command }: Context) {
    const output = await command.run('test --cmd', {
      path: Path.fixtures('consoles/import-alias-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/test!')
  }

  @Test()
  public async shouldBeAbleToExecuteTestCommandUsingAnAbsolutePathEntry({ command }: Context) {
    const output = await command.run('test --cmd', {
      path: Path.fixtures('consoles/absolute-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/test!')
  }

  @Test()
  public async shouldBeAbleToExecuteTestCommandUsingARelativePathEntry({ command }: Context) {
    const output = await command.run('test --cmd', {
      path: Path.fixtures('consoles/relative-path-entry.ts')
    })

    output.assertSucceeded()
    output.assertLogged('Hello from #tests/fixtures/entrypoints/test!')
  }
}
