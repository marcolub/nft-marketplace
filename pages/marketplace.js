import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'
import { Row, Switch } from 'antd'

export default function Marketplace() {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract, account, isReady, network } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [account, isReady])

  async function loadNFTs() {
    if (!isReady) return
    const data = await marketplaceContract.getAvailableMarketItems()
    var final = await Promise.all(data.map(mapAvailableMarketItems(process.env["NFT_ADDRESS"])))
    final.sort((x) => x.marketItemId)
    setNfts(final)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain />
  if (isLoading) return <LinearProgress />
  if (!isLoading && !nfts.length) return <h1>No NFTs for sale</h1>
  return (
    <>
      <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false} />
    </>
  )
}
