
import { useContext } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { Web3Context } from '../providers/Web3Provider'
import NavItem from '../atoms/NavItem'
import ConnectedAccountAddress from '../atoms/ConnectedAccountAddress'
import ConnectButton from '../atoms/ConnectButton'
import {Row,Col} from 'antd';

const NavBar = () => {
  const { account } = useContext(Web3Context)

  return (
    <AppBar style={{ backgroundColor:'#001529', opacity: '.5'}} position="static">
      <Container style={{height: '50px'}}>
        <Row>
          <Col span={22} style={{marginTop: '6px'}} type="flex" align="right" >
          {account ? <ConnectedAccountAddress account={account} /> : <ConnectButton />}
          </Col>
          </Row>
      </Container>
    </AppBar>
  )
}
export default NavBar
