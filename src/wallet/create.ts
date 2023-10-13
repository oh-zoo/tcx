import {Command, ux} from '@oclif/core'
import {encryptToKeyStore, generatePhrase, validatePhrase} from '@xchainjs/xchain-crypto'
import chalk from 'chalk'
import inquirer from 'inquirer';
import {clear} from 'node:console'
import * as fs from 'node:fs'
import * as os from 'node:os'

export async function create(command: Command): Promise<string | undefined> {
  console.log('creating wallet')

  const tcxDir = `${os.homedir()}/keystores`
  if (!fs.existsSync(tcxDir)) {
    fs.mkdirSync(tcxDir, {recursive: true})
  }

  const phrase = generatePhrase()
  const isCorrect = validatePhrase(phrase) // validate phrase if needed returns Boolean
  if (!isCorrect) {
    command.error('Error generating phrase')
  }

  const path = await inquirer.prompt([
    {
      default: tcxDir,
      message: 'Where would you like to save this keystore?',
      name: 'name',
      type: 'input',
    },
  ])

  const name: string = await ux.prompt('Name this keystore')
  const fileName = name.toLowerCase().replace(' ', '_')

  if (fs.existsSync(`${path}/${fileName}.txt`)) {
    command.error(chalk.red.bold('Keystore with this name already exists'))
  }

  const password = await ux.prompt('Create a password', {type: 'hide'})
  const confirmPassword = await ux.prompt('Confirm password', {type: 'hide'})

  if (password !== confirmPassword) {
    command.error('Passwords do not match')
  }

  const keystore = await encryptToKeyStore(phrase, password)

  fs.writeFileSync(`${tcxDir}/${fileName}.txt`, JSON.stringify(keystore))

  // OR if above doesnt work...
  // const bl = new Blob([JSON.stringify(keystore)], {
  //   type: 'text/plain',
  // })
  // fs.writeFileSync('/tmp/test-sync', await bl.text())
  const splitPhrase = phrase.split(' ')

  command.log('')
  command.log(chalk.yellow('Store your recovery phrase somewhere safe!'))
  command.log('===========')
  command.log(chalk.blueBright(splitPhrase.slice(0, 4).join(' ')))
  command.log(chalk.blueBright(splitPhrase.slice(4, 8).join(' ')))
  command.log(chalk.blueBright(splitPhrase.slice(8, 12).join(' ')))
  command.log('===========')

  await ux.anykey('Press any key to continue')
  clear()

  return phrase
}
