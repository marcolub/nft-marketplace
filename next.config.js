module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io']
  },
  env: {
    NFT_ADDRESS: process.env.NFT_ADDRESS,
    ALCHEMY_KEY: process.env.ALCHEMY_KEY
  }
}
