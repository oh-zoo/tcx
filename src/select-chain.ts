import inquirer from 'inquirer'

import {Pools} from './types'

export const selectChainPrompt = async (pools: Pools): Promise<string> => {
  const chains = pools.map(pool => pool.asset.split('.')[0])
  const uniqueChains = [...new Set(chains)]

  const {chain}: {chain: string} = await inquirer.prompt([
    {
      choices: uniqueChains,
      message: 'Select a chain',
      name: 'chain',
      type: 'list',
    },
  ])

  return chain
}
