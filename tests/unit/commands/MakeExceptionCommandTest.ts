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

export default class MakeExceptionCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAExceptionFile({ assert, command }: Context) {
    const output = await command.run('make:exception TestException')

    output.assertSucceeded()
    output.assertLogged('[ MAKING EXCEPTION ]')
    output.assertLogged('[  success  ] Exception "TestException" successfully created.')

    assert.isTrue(await File.exists(Path.exceptions('TestException.ts')))
  }

  @Test()
  public async shouldBeAbleToCreateAExceptionFileWithADifferentDestPath({ assert, command }: Context) {
    const output = await command.run('make:exception TestException', {
      path: Path.fixtures('consoles/console-mock-dest-import.ts')
    })

    output.assertSucceeded()
    output.assertLogged('[ MAKING EXCEPTION ]')
    output.assertLogged('[  success  ] Exception "TestException" successfully created.')

    assert.isTrue(await File.exists(Path.fixtures('storage/exceptions/TestException.ts')))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ command }: Context) {
    await command.run('make:exception TestException')
    const output = await command.run('make:exception TestException')

    output.assertFailed()
    output.assertLogged('[ MAKING EXCEPTION ]')
    output.assertLogged('The file')
    output.assertLogged('TestException.ts')
    output.assertLogged('already exists')
  }
}
