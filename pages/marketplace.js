import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'

export default function Marketplace () {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract,CardNftContract, SoldierNftContract,MaterialNftContract,account, isReady, network } = useContext(Web3Context)

  useEffect(() => {
    loadNFTs()
  }, [account,isReady])

  async function loadNFTs () {
    if (!isReady) return
    const data = await marketplaceContract.fetchAvailableMarketItems()
    var items1 = await Promise.all(data.map(mapAvailableMarketItems(SoldierNftContract)))
    var items2 = await Promise.all(data.map(mapAvailableMarketItems(MaterialNftContract)))
    var items3 = await Promise.all(data.map(mapAvailableMarketItems(CardNftContract)))
    const items = items1.concat(items2).concat(items3)
    items.sort((x)=>x.marketItemId)
    setNfts(items)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain/>
  if (isLoading) return <LinearProgress/>
  if (!isLoading && !nfts.length) return <h1>No NFTs for sale</h1>
  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false}/>
  )
}
