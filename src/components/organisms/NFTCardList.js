import InfiniteScroll from 'react-infinite-scroll-component'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Fade from '@mui/material/Fade'
import { makeStyles } from '@mui/styles'
import NFTCard from '../molecules/NFTCard'
import NFTCardCreation from '../molecules/NFTCardCreation'
import { ethers } from 'ethers'
import { Web3Context } from '../providers/Web3Provider'
import { useContext } from 'react'
import { mapCreatedAndOwnedTokenIdsAsMarketItems } from '../../utils/nft'
import { useEffect } from 'react'

const useStyles = makeStyles((theme) => ({
  grid: {
    spacing: 3,
    alignItems: 'stretch'
  },
  gridItem: {
    display: 'flex',
    transition: 'all .3s',
    [theme.breakpoints.down('sm')]: {
      margin: '0 20px'
    }
  }
}))

export default function NFTCardList({ nfts, setNfts, withCreateNFT }) {
  const classes = useStyles()
  const { account, isReady, marketplaceContract, SoldierNftContract, MaterialNftContract } = useContext(Web3Context)

  async function updateNFT(index, tokenId) {
    var updatedNFt = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, SoldierNftContract, account)(tokenId)
    if (updateNFt != undefined) {
      setNfts(prevNfts => {
        const updatedNfts = [...prevNfts]
        updatedNfts[index] = updatedNFt
      })
    }
    updatedNFt = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, MaterialNftContract, account)(tokenId)
    if (updateNFt != undefined) {
      setNfts(prevNfts => {
        const updatedNfts = [...prevNfts]
        updatedNfts[index] = updatedNFt
        return updatedNfts
      })
    }
  }

  async function addNFTToList(tokenId) {
    var nft = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, SoldierNftContract, account)(tokenId)
    setNfts(prevNfts => [...prevNfts, nft])
    nft = await mapCreatedAndOwnedTokenIdsAsMarketItems(marketplaceContract, MaterialNftContract, account)(tokenId)
    setNfts(prevNfts => [...prevNfts, nft])
  }

  function NFT({ nft, index }) {
    if (nft != undefined) {
      if (!nft.owner && nft[0] != undefined) {
        return <NFTCardCreation addNFTToList={addNFTToList} />
      }

      if (nft.owner === account && nft.marketItemId && !nft.hasMarketApproval) {
        return <NFTCard nft={nft} action="approve" updateNFT={() => updateNFT(index, nft.tokenId)} />
      }

      if (nft.owner === account) {
        return <NFTCard nft={nft} action="sell" updateNFT={() => updateNFT(index, nft.tokenId)} />
      }

      if (nft.seller === account && !nft.sold) {
        return <NFTCard nft={nft} action="cancel" updateNFT={() => updateNFT(index, nft.tokenId)} />
      }

      if (nft.owner === ethers.constants.AddressZero) {
        return <NFTCard nft={nft} action="buy" updateNFT={() => updateNFT(index, nft.tokenId)} />
      }
    }
    return <div className='tohide' />
  }

  return (
    <>
      {nfts != undefined &&
        <InfiniteScroll
          dataLength={nfts.length}
          loader={<LinearProgress />}
        >
          <Grid container className={classes.grid} id="grid">
            {withCreateNFT && <Grid item xs={12} sm={6} md={3} className={classes.gridItem}>
              <NFTCardCreation addNFTToList={addNFTToList} />
            </Grid>}
            {nfts.map((nft, i) =>
              nft != undefined &&
              <Fade in={true} key={i}>
                <Grid item xs={12} sm={6} md={3} className={classes.gridItem} >
                  <NFT nft={nft} index={i} />
                </Grid>
              </Fade>
            )}
          </Grid>
        </InfiniteScroll>
      }
    </>
  )
}
