import {Command} from '@oclif/core'
import {Network} from '@xchainjs/xchain-client'

import {selectChainPrompt} from '../select-chain'
import {Pools} from '../types'
import {xchainClientByChain} from './utils'
const qrcode = require('qrcode')
import chalk from 'chalk'

export const receive = async ({command, network, phrase, pools}: {command: Command, network: Network, phrase: string, pools: Pools}): Promise<void> => {
  const selectedChain = await selectChainPrompt(pools)

  const client = xchainClientByChain({chain: selectedChain, command, network, phrase})

  if (!client) {
    command.error('No client found')
  }

  const address = await client?.getAddress()
  const options = {
    type: 'terminal', // Render as text in the terminal
  }

  command.log()
  const qrCode = await qrcode.toString(address, options)
  command.log(qrCode)
  command.log()
  command.log('BTC ADDRESS:', chalk.green.bold(address))
  command.log()
}
