
import { ethers } from 'ethers'
import { useContext, useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import { Card, CardActions, CardContent, CardMedia, Button, Divider, Box, CircularProgress } from '@mui/material'
import { NFTModalContext } from '../src/components/providers/NFTModalProvider'
import { Web3Context } from '../src/components/providers/Web3Provider'
import { Table } from 'antd'
import axios from 'axios'
import { useRouter } from 'next/router';

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
    const listingFee = await marketplaceContract.getListingFee()
    setListingFee(ethers.utils.formatUnits(listingFee, 'ether'))
}

export default function Details({ }) {
    const { setModalNFT, setIsModalOpen } = useContext(NFTModalContext)
    const { account, marketplaceContract, nftContract, isReady, hasWeb3, network } = useContext(Web3Context)
    const [metadata, setMetadata] = useState({})
    const [data, setData] = useState([])
    const [traits, setTraits] = useState({})

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
        console.log(nftContract)
    }, [account, isReady])

    useEffect(() => {
        SETmyresultarray([])
        Object.entries(metadata).map(([key, val]) => {
            if (key == 'image') SETmyresultcoverimage(val.replace('ipfs://', 'https://gateway.ipfs.io/ipfs/'))
            else if (key == 'traits') setTraits(val)
            else SETmyresultarray(current => [...current, val])
        })
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
        if (nftContract != null) {
            setData([])
            const resp = await axios.get(`https://api.covalenthq.com/v1/80001/tokens/${nftContract.address}/nft_transactions/${tokenId}/?key=ckey_ccf942cdee9b4cd6b223e2d5767`)

            console.log(resp.data.data.items[0].nft_transactions)
            resp.data.data.items[0].nft_transactions.forEach((value) => {
                const tempevent = ''
                
                const tempprice =  value.value == 0 ? '-' : `${value.value}`
                var temp = {
                    from_address: value.from_address,
                    to_address: value.to_address,
                    event: tempevent,
                    price: tempprice,
                }
                setData(current => [...current, temp])
            })
        }
    }


    const fetchdata = () => {
        if (nftContract != null) {
            axios.get(`https://api.covalenthq.com/v1/80001/tokens/${nftContract.address}/nft_metadata/${tokenId}/?key=ckey_ccf942cdee9b4cd6b223e2d5767`)
                .then(resp => {
                    const url = resp.data.data.items[0].nft_data[0].token_url
                    axios.get(url).then(resp2 => {
                        setMetadata(resp2.data)
                    });
                });
        }
    }

    return (
        <>
            <img style={{width:'512px',height:'512px'}} src={image}></img>
            <Divider className={classes.firstDivider} />
            <div >
                <div>
                <h2>{name}</h2>
                <h2>{description}</h2>
                </div>
                <Divider className={classes.firstDivider} />
                <div>
                    {Object.entries(traits).map(([key, val]) => {
                        return <Row style={{ paddingLeft: '10%' }} key={Object.entries(traits).indexOf(val)}>
                            <h2><a>{key}</a> {val}</h2>
                        </Row>
                    })}
                </div>
                <Divider className={classes.firstDivider} />
                <Table columns={columns} dataSource={data} />
            </div>
        </>
    )
}
