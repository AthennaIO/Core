/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake, SinonSpy } from 'sinon'

export class ExitFaker {
  public static original = process.exit
  public static faker: SinonSpy<[code?: number], never>

  public static fake(): typeof ExitFaker {
    this.faker = fake() as SinonSpy<[code?: number], never>
    process.exit = this.faker

    return this
  }

  public static get(): SinonSpy<[code?: number], never> {
    return this.faker
  }

  public static release(): typeof ExitFaker {
    this.faker = undefined
    process.exit = this.original

    return this
  }
}
