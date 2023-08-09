/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { sep, resolve, isAbsolute } from 'node:path'
import { BaseCommand, Argument, Option } from '@athenna/artisan'

export class MakeTestCommand extends BaseCommand {
  @Argument({
    description: 'The test name.',
  })
  public name: string

  @Option({
    description: 'Create an unitary test.',
    signature: '-u, --unit',
    default: false,
  })
  public isUnit: boolean

  @Option({
    description: 'Create the test as function instead of class.',
    signature: '--function',
    default: false,
  })
  public isFunction: boolean

  public static signature(): string {
    return 'make:test'
  }

  public static description(): string {
    return 'Make a new test file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING TEST ])\n')

    let template = 'test'

    if (this.isFunction) {
      template = 'testFn'
    }

    const file = await this.generator
      .path(this.getFilePath())
      .template(template)
      .setNameProperties(true)
      .make()

    this.logger.success(`Test ({yellow} "${file.name}") successfully created.`)
  }

  /**
   * Get the file path where it will be generated.
   */
  private getFilePath(): string {
    return this.getDestinationPath().concat(`${sep}${this.name}.${Path.ext()}`)
  }

  /**
   * Get the destination path for the file that will be generated.
   */
  private getDestinationPath(): string {
    let destination = Config.get(
      'rc.commands.make:test.destination',
      this.isUnit ? Path.tests('Unit') : Path.tests('E2E'),
    )

    if (!isAbsolute(destination)) {
      destination = resolve(Path.pwd(), destination)
    }

    return destination
  }
}
