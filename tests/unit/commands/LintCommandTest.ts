/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, File, Folder } from '@athenna/common'
import { Test, AfterEach, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

/**
 * The fixtures are written by the test itself instead of living in the
 * repository, otherwise the "lint:fix" script of this package would format
 * the badly formatted one before the test ever ran.
 */
const DIRTY = `export class Dirty {\n    public   hello( ) : string {\n        const unused = 1;\n        return "world"   ;\n    }\n}\n`
const CLEAN = `export class Clean {\n  public hello(): string {\n    return 'world'\n  }\n}\n`

export default class LintCommandTest extends BaseCommandTest {
  private folder = Path.fixtures('lint')

  @AfterEach()
  public async removeLintFixtures() {
    await Folder.safeRemove(this.folder)
  }

  private async createFixture(name: string, content: string) {
    await new File(`${this.folder}/${name}`, Buffer.from(content)).load()
  }

  @Test()
  public async shouldBeAbleToLintTheApplicationCode({ command }: Context) {
    await this.createFixture('clean.ts', CLEAN)

    const output = await command.run(`lint ${this.folder}`)

    output.assertSucceeded()
    output.assertLogged('No lint problems found')
  }

  @Test()
  public async shouldFailWhenThereAreLintErrorsThatCouldNotBeFixed({ command }: Context) {
    await this.createFixture('dirty.ts', DIRTY)

    const output = await command.run(`lint ${this.folder}`)

    output.assertFailed()
    output.assertLogged('@typescript-eslint/no-unused-vars')
  }

  @Test()
  public async shouldBeAbleToFixLintProblemsUsingTheFixOption({ assert, command }: Context) {
    await this.createFixture('dirty.ts', DIRTY)

    await command.run(`lint ${this.folder} --fix`)

    const content = await new File(`${this.folder}/dirty.ts`).getContentAsString()

    assert.include(content, `return 'world'`)
    assert.notInclude(content, `return "world"   ;`)
  }

  @Test()
  public async shouldOnlyReportErrorsWhenUsingTheQuietOption({ command }: Context) {
    await this.createFixture('clean.ts', CLEAN)

    const output = await command.run(`lint ${this.folder} --quiet`)

    output.assertSucceeded()
    output.assertLogged('No lint problems found')
  }
}
