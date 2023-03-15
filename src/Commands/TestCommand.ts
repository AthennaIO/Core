/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { BaseCommand, Option, CommandSettings } from '@athenna/artisan'

export class TestCommand extends BaseCommand {
  @Option({
    signature: '--e2e',
    description: 'Run only e2e test suite.',
    default: false,
  })
  public e2e: boolean

  @Option({
    signature: '--unit',
    description: 'Run only unit test suite.',
    default: false,
  })
  public unit: boolean

  @Option({
    signature: '-e, --env <env>',
    description:
      'Change the evironment where your tests wil run. Default is "test"',
    default: 'test',
  })
  public env: string

  @Option({
    signature: '--debug',
    description: 'Enable API debug mode to see more logs.',
    default: false,
  })
  public debug: boolean

  public static settings(): CommandSettings {
    return {
      stayAlive: true,
    }
  }

  public static signature(): string {
    return 'test'
  }

  public static description(): string {
    return 'Run the tests of your application.'
  }

  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    const protectedArgs = ['--e2e', '--unit', '--debug']

    process.argv = process.argv.filter(arg => !protectedArgs.includes(arg))

    if (this.e2e) {
      process.argv.push('E2E')
    }

    if (this.unit) {
      process.argv.push('Unit')
    }

    if (this.debug) {
      process.env.DEBUG = 'api:*'
    }

    await Module.resolve(
      Config.get('rc.commandsPaths.test', '#tests/main'),
      Config.get('rc.meta'),
    )
  }
}
