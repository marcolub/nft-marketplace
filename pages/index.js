import { useContext, useEffect, useState } from 'react'
import NFTCardList from '../src/components/organisms/NFTCardList'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { LinearProgress } from '@mui/material'
import UnsupportedChain from '../src/components/molecules/UnsupportedChain'
import { mapAvailableMarketItems } from '../src/utils/nft'

export default function Home () {
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { marketplaceContract, SoldierNftContract,MaterialNftContract, isReady, network } = useContext(Web3Context)

  Promise.delay = function (t, val) {
    return new Promise(resolve => {
      setTimeout(resolve.bind(null, val), t);
    });
  }

  Promise.raceAll = function (promises, timeoutTime, timeoutVal) {
    return Promise.all(promises.map(p => {
      return Promise.race([p, Promise.delay(timeoutTime, timeoutVal)])
    }));
  }

  useEffect(() => {
    loadNFTs()
  }, [isReady])
  async function loadNFTs () {
    if (!isReady) return
    const data = await marketplaceContract.fetchAvailableMarketItems()
    var items1 = await Promise.all(data.map(mapAvailableMarketItems(SoldierNftContract)))
    // var items2 = await Promise.raceAll(data.map(mapAvailableMarketItems(MaterialNftContract))
    // , 1000, null).then(results => {
    //   let final = results.filter(item => !!item);
    //   return final
    // })
    // const items = items1.concat(items2)
    setNfts(items1)
    setIsLoading(false)
  }

  if (!network) return <UnsupportedChain/>
  if (isLoading) return <LinearProgress/>
  if (!isLoading && !nfts.length) return <h1>No NFTs for sale</h1>
  return (
    <NFTCardList nfts={nfts} setNfts={setNfts} withCreateNFT={false}/>
  )
}
