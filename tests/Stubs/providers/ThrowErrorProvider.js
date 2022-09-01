import { ServiceProvider } from '@athenna/ioc'
import { PrettyException } from '#tests/Stubs/app/Exceptions/PrettyException'

export class ThrowErrorProvider extends ServiceProvider {
  register() {
    if (process.env.THROW_ERROR_PROVIDER && process.env.THROW_ERROR_PROVIDER === 'true') {
      throw new Error('Some error')
    }

    if (process.env.THROW_EXCEPTION_PROVIDER && process.env.THROW_EXCEPTION_PROVIDER === 'true') {
      throw new PrettyException()
    }
  }
}
