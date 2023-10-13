import {Command, ux} from '@oclif/core'
import {decryptFromKeystore} from '@xchainjs/xchain-crypto'
import chalk from 'chalk'
import * as fs from 'node:fs'

export const connect = async (command: Command): Promise<string | undefined> => {
  const path = await ux.prompt('Drop your keystore here')

  // check if path exists
  if (!fs.existsSync(path)) {
    command.error(chalk.red('File not found'))
  }

  const file = fs.readFileSync(path)
  const json = JSON.parse(file.toString())
  const password = await ux.prompt('Enter your password', {type: 'hide'})

  let phrase: string
  try {
    phrase = await decryptFromKeystore(json, password)
  } catch {
    command.error(chalk.red('Incorrect password'))
  }

  return phrase
}
