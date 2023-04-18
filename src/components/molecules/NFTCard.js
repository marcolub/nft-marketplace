
import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress } from '@mui/material'
import { NFTModalContext } from '../providers/NFTModalProvider'
import { Web3Context } from '../providers/Web3Provider'
import NFTDescription from '../atoms/NFTDescription'
import NFTPrice from '../atoms/NFTPrice'
import NFTName from '../atoms/NFTName'
import CardAddresses from './CardAddresses'
import PriceTextField from '../atoms/PriceTextField'
import { useRouter } from 'next/router';
import { Details } from '@mui/icons-material'

const useStyles = makeStyles({
  root: {
    flexDirection: 'column',
    display: 'flex',
    margin: '15px',
    flexGrow: 1,
    maxWidth: 345
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
    cursor: 'pointer'
  },
  cardContent: {
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  firstDivider: {
    margin: 'auto 0 10px'
  },
  lastDivider: {
    marginTop: '10px'
  },
  addressesAndPrice: {
    display: 'flex',
    flexDirection: 'row'
  },
  addessesContainer: {
    margin: 'auto',
    width: '60%'
  },
  priceContainer: {
    width: '40%',
    margin: 'auto'
  },
  cardActions: {
    marginTop: 'auto',
    padding: '0 16px 8px 16px'
  }
})

async function getAndSetListingFee(marketplaceContract, setListingFee) {
  if (!marketplaceContract) return
  const listingFee = await marketplaceContract.marketplaceFee()
  setListingFee(ethers.utils.formatUnits(listingFee, 'ether'))
}

const NFTCard = ({ nft, action, updateNFT }) => {
  const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
  const { stakerContract,marketplaceContract, hasWeb3 } = useContext(Web3Context)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [listingFee, setListingFee] = useState('')
  const [priceError, setPriceError] = useState(false)
  const [newPrice, setPrice] = useState(0)
  const classes = useStyles()
  const { name, description, image } = nft

  // if (name != undefined) {
  //   if (name.startsWith('Soldier')) nftContract = SoldierNftContract
  //   if (name.startsWith('Material')) nftContract = MaterialNftContract
  //   if (name.startsWith('Card')) nftContract = CardNftContract
  // }
  const router = useRouter();

  useEffect(() => {
    getAndSetListingFee(marketplaceContract, setListingFee)
  }, [])

  const actions = {
    stake: {
      text: 'stake',
      method: stakeNft
    },
    unstake: {
      text: 'unstake',
      method: unstakeNft
    },
    buy: {
      text: 'buy',
      method: buyNft
    },
    cancel: {
      text: 'cancel',
      method: cancelNft
    },
    // approve: {
    //   text: 'Approve for selling',
    //   method: approveNft
    // },
    sell: {
      text: listingFee ? `Sell (${listingFee} fee)` : 'Sell',
      method: sellNft
    },
    none: {
      text: '',
      method: () => { }
    }
  }

  async function unstakeNft(nft) {
    await stakerContract.withdraw([nft.tokenId])
  }

  async function stakeNft(nft){
    await stakerContract.stake([nft.tokenId])
  }

  async function buyNft(nft) {
    const sellId = await marketplaceContract.sellIdfromTokenId(nft.tokenId);
    await marketplaceContract.buyListToken(sellId);
    updateNFT()
  }

  async function cancelNft(nft) {
    const sellId = await marketplaceContract.sellIdfromTokenId(nft.tokenId);
    await marketplaceContract.cancelList(sellId);
    updateNFT()
  }

  // async function approveNft(nft) {
  //   const approveTx = await nftContract.approve(marketplaceContract.address, nft.tokenId)
  //   await approveTx.wait()
  //   updateNFT()
  //   return approveTx
  // }

  async function sellNft(nft) {
    if (!newPrice) {
      setPriceError(true)
      return
    }
    setPriceError(false)
    const listingFee = await marketplaceContract.marketplaceFee()
    const priceInWei = ethers.utils.parseUnits(newPrice, 'ether')
    
    await marketplaceContract.createList(
      process.env["NFT_ADDRESS"],
      nft.tokenId,
      86400,
      priceInWei
    )

    updateNFT()
  }

  function handleCardImageClick() {
    router.push({
      pathname: '/details',
      query: {
        name: nft.name,
        description: nft.description,
        tokenId: parseInt(nft.tokenId),
        image: nft.image
      }
    })
  }

  async function onClick(nft) {
    try {
      setIsLoading(true)
      await actions[action].method(nft)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card
      className={classes.root}
      raised={isHovered}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardMedia
        className={classes.media}
        alt={name}
        image={image}
        component="a" onClick={handleCardImageClick}
      />

      <CardContent className={classes.cardContent} >
        <NFTName name={name} />
        <NFTDescription description={description} />
        <Divider className={classes.firstDivider} />
        <Box className={classes.addressesAndPrice}>
          <div className={classes.addessesContainer}>
            <CardAddresses nft={nft} />
          </div>
          <div className={classes.priceContainer}>
            {action === 'sell'
              ? <PriceTextField listingFee={listingFee} error={priceError} disabled={isLoading} onChange={e => setPrice(e.target.value)} />
              : <NFTPrice nft={nft} />
            }
          </div>
        </Box>
        <Divider className={classes.lastDivider} />
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button size="small" onClick={() => !isLoading && onClick(nft)}>
          {isLoading
            ? <CircularProgress size="20px" />
            : hasWeb3 && actions[action].text
          }
        </Button>
      </CardActions>
    </Card>
  )
}

export default NFTCard