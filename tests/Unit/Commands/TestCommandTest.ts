/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { Test, TestContext } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class TestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunTheApplicationTests({ assert }: TestContext) {
    const { stdout } = await Artisan.callInChild('test', this.artisan)

    assert.isTrue(stdout.includes('running tests'))
  }

  @Test()
  public async shouldBeAbleToRunTheApplicationTestsWithDifferentNodeEnv({ assert }: TestContext) {
    const { stdout } = await Artisan.callInChild('test --env heyhey', this.artisan)

    assert.isTrue(stdout.includes('heyhey'))
  }

  @Test()
  public async shouldBeAbleToRunOnlyTheUnitTestSuiteOfTheApplication({ assert }: TestContext) {
    const { stdout } = await Artisan.callInChild('test --unit', this.artisan)

    assert.isTrue(stdout.includes('Unit'))
  }

  @Test()
  public async shouldBeAbleToRunOnlyTheE2ETestSuiteOfTheApplication({ assert }: TestContext) {
    const { stdout } = await Artisan.callInChild('test --e2e', this.artisan)

    assert.isTrue(stdout.includes('E2E'))
  }

  @Test()
  public async shouldBeAbleToRunTheApplicationTestsInApiDebugMode({ assert }: TestContext) {
    const { stdout } = await Artisan.callInChild('test --debug', this.artisan)

    assert.isTrue(stdout.includes('api:*'))
  }
}
