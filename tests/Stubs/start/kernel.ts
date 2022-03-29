import { Ignite } from '../../../src/Ignite'

async function main() {
  await new Ignite(__filename).httpServer()
}

main().catch()
