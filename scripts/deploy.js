const hre = require('hardhat')
const dotenv = require('dotenv')
const fs = require('fs')

function replaceEnvContractAddresses (marketplaceAddress, soldier,material,card, networkName) {
  const envFileName = '.env.local'
  const envFile = fs.readFileSync(envFileName, 'utf-8')
  const env = dotenv.parse(envFile)
  env[`MARKETPLACE_CONTRACT_ADDRESS_${networkName}`] = marketplaceAddress
  env[`SOLDIER_CONTRACT_ADDRESS_${networkName}`] = soldier
  env[`MATERIAL_CONTRACT_ADDRESS_${networkName}`] = material
  env[`CARD_CONTRACT_ADDRESS_${networkName}`] = card
  const newEnv = Object.entries(env).reduce((env, [key, value]) => {
    return `${env}${key}=${value}\n`
  }, '')

  fs.writeFileSync(envFileName, newEnv)
}

async function main () {
  process.env.IS_RUNNING = true
  const Marketplace = await hre.ethers.getContractFactory('Marketplace')
  const marketplace = await Marketplace.deploy()
  await marketplace.deployed()
  console.log('Marketplace deployed to:', marketplace.address)

  const HappywarSoldier = await hre.ethers.getContractFactory('HappywarSoldier')
  const soldier = await HappywarSoldier.deploy(marketplace.address)
  await soldier.deployed()
  console.log('Soldier Nft deployed to:', soldier.address)

  const HappywarMaterial = await hre.ethers.getContractFactory('HappywarMaterial')
  const material = await HappywarMaterial.deploy(marketplace.address)
  await material.deployed()
  console.log('Material Nft deployed to:', material.address)

  const CardMaterial = await hre.ethers.getContractFactory('HappywarMaterial')
  const card = await CardMaterial.deploy(marketplace.address)
  await card.deployed()
  console.log('Card Nft deployed to:', card.address)

  replaceEnvContractAddresses(marketplace.address, soldier.address, material.address,card.address, hre.network.name.toUpperCase())
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
