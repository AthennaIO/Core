/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File, Path } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeTestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateATestFile({ assert, command }: Context) {
    const output = await command.run('make:test TestTest')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.tests('e2e/TestTest.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileInUnitFolder({ assert, command }: Context) {
    const output = await command.run('make:test TestTest --unit')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.tests('unit/TestTest.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileUsingHttpTemplate({ assert, command }: Context) {
    const output = await command.run('make:test TestTest --http')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.tests('e2e/TestTest.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileUsingConsoleTemplate({ assert, command }: Context) {
    const output = await command.run('make:test TestTest --console')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.tests('e2e/TestTest.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileUsingFunctionalTemplate({ assert, command }: Context) {
    const output = await command.run('make:test TestTest --function')

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.tests('e2e/TestTest.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileWithADifferentDestPath({ assert, command }: Context) {
    const output = await command.run('make:test TestTest', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('[  success  ] Test "TestTest" successfully created.')

    assert.isTrue(await File.exists(Path.fixtures('storage/tests/TestTest.ts')))
  }

  @Test()
  public async shouldThrowAnTestWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:test TestTest')
    const output = await command.run('make:test TestTest')

    output.assertFailed()
    output.assertLogged('[ MAKING TEST ]')
    output.assertLogged('The file')
    output.assertLogged('TestTest.ts')
    output.assertLogged('already exists')
  }
}
