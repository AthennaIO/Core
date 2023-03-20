import { Service } from '#src'

@Service()
export class DecoratedWelcomeService {
  public greet(name: string) {
    return `Hello ${name}`
  }
}
