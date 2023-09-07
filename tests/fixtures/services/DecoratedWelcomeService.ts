import { Service } from '@athenna/ioc'

@Service()
export class DecoratedWelcomeService {
  public greet(name: string) {
    return `Hello ${name}`
  }
}
