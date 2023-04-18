
import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress } from '@mui/material'
import { NFTModalContext } from '../src/components/providers/NFTModalProvider'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { Table, Row } from 'antd'
import axios from 'axios'
import { useRouter } from 'next/router';
import { getTransactionsHistory, getTokenMetadataByTokenId } from '../src/utils/nft'

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

export default function Details({ }) {
    const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
    const { account, marketplaceContract, isReady, hasWeb3, network } = useContext(Web3Context)
    const [metadata, setMetadata] = useState({})
    const [data, setData] = useState([])
    const [traits, setTraits] = useState([])

    const [myresultcoverimage, SETmyresultcoverimage] = useState("")
    const [myresultarray, SETmyresultarray] = useState([])
    const [isHovered, setIsHovered] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [listingFee, setListingFee] = useState('')
    const [priceError, setPriceError] = useState(false)
    const [newPrice, setPrice] = useState(0)
    const classes = useStyles()

    const router = useRouter();
    const { name, description, tokenId, image } = router.query

    useEffect(() => {
        getAndSetListingFee(marketplaceContract, setListingFee)
        fetchdata()
        fetchTable()
    }, [account, isReady])

    useEffect(() => {
        SETmyresultarray([])
        if (metadata !== undefined) {
            Object.entries(metadata).map(([key, val]) => {
                if (key == 'image') SETmyresultcoverimage(val.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/'))
                else if (key == 'attributes') {
                    setTraits(val)
                }
                else SETmyresultarray(current => [...current, val])
            })
        }
    }, [metadata, traits]);

    const columns = [
        {
            title: 'From',
            dataIndex: 'from_address',
            key: 'from_address',
        },
        {
            title: 'To',
            dataIndex: 'to_address',
            key: 'to_address',
        },
        {
            title: 'Event',
            dataIndex: 'event',
            key: 'event',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
    ];

    const fetchTable = async () => {

        setData([])
        const resp = await getTransactionsHistory(process.env["NFT_ADDRESS"], tokenId);
        console.log(resp);
        resp.forEach((tx) => {
            var tempevent = ''
            if(tx.from == ethers.constants.AddressZero){
                tempevent = 'mint'
            }
            else if (tx.value == listingFee) {
                tempevent = 'list'
            }
            else if (tx.value > 0) {
                tempevent = 'sell'
            }
            const tempprice = tx.value == 0 || tx.value == null ? '-' : `${tx.value}`
            var temp = {
                from_address: tx.from,
                to_address: tx.to,
                event: tempevent,
                price: tempprice,
            }
            setData(current => [...current, temp])
        })

    }


    const fetchdata = async () => {
        const result = await getTokenMetadataByTokenId(process.env["NFT_ADDRESS"], tokenId);
        setMetadata(result);
    }

    return (
        <>
            <Row>
                <img style={{ width: '512px', height: '512px' }} src={image}></img>
                <Divider className={classes.firstDivider} />
                <div>

                    {traits.map((trait, i) => {
                        return <div style={{ paddingLeft: '10%' }} key={trait.value}>
                            <h2><a>{trait.trait_type}</a></h2><h2> {trait.value}</h2>
                        </div>
                    })}
                </div>
            </Row>
            <div >
                <div>
                    <h2>{name}</h2>
                    <h2>{description}</h2>
                </div>
                <Divider className={classes.firstDivider} />
                <Divider className={classes.firstDivider} />
                <Table columns={columns} dataSource={data} />
            </div>
        </>
    )
}
