import React, { useState } from 'react';
import { useEffect } from "react";
import {
    DesktopOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import Web3 from 'web3';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { BrowserRouter, Routes, Route, useNavigate, Link, Switch } from "react-router-dom";
// import logo from '../img/logo.png'

const { Header, Content, Footer, Sider } = Layout;


function getItem(
    label,
    key,
    icon,
    children,
) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const App = () => {
    const [collapsed, setCollapsed] = useState(true);
    const [keyPage, setKeyPage] = useState('home1')
    const [address, setAddress] = useState('')

    const login = async () => {

        if (typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum);
            var accounts = await web3.eth.requestAccounts();
            setAddress(accounts[0])
            try {
                await window.ethereum.enable();
                return true
            } catch (e) {
                return false
            }
        }
    }

    useEffect(() => {
        login()
    }, []);

    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuClick = (info) => {
        setKeyPage(info.key)
    }

    const giveMenu = () => {
        if (keyPage.startsWith('market') || keyPage == 'home2') {
            return <Menu onClick={menuClick} theme="dark" mode="inline" >
                <Menu.Item key="home4">
                    <Link to="/">
                        <PieChartOutlined />
                        <span>Home</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="market2">
                    <Link to="/my-nfts">
                        <UserOutlined />
                        <span>My NFTs</span>
                    </Link>
                </Menu.Item>

                <Menu.SubMenu title="Collections">
                    <Menu.Item key="market4">

                        <span>Soldier</span>

                    </Menu.Item>
                    <Menu.Item key="market5">
                        <span>Card</span>
                    </Menu.Item>
                    <Menu.Item key="market6">
                        <span>Material</span>
                    </Menu.Item>
                </Menu.SubMenu>

            </Menu>
        }
        else if (keyPage.startsWith('home')) {
            return <Menu onClick={menuClick} theme="dark" mode="inline">
                <Menu.Item key="home1">

                    <PieChartOutlined />
                    <span>Home</span>

                </Menu.Item>
                <Menu.Item key="home2">
                    <DesktopOutlined />
                    <Link to="/">
                        <span>Marketplace</span>
                    </Link>
                </Menu.Item>
                <Menu.Item key="home3">
                    <DesktopOutlined />
                    <span>Login</span>
                </Menu.Item>
            </Menu>
        }
    }

    return (
        <BrowserRouter>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 100, background: 'rgba(255, 255, 255, 0.2)' }} >
                        {/* <img src={logo} style={{ height: 80 }}></img> */}
                    </div>
                    {giveMenu()}
                </Sider>
                <Layout className="site-layout">
                    <Header style={{ padding: 0, background: colorBgContainer }} />
                    <Content style={{ margin: '0 16px' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>User</Breadcrumb.Item>
                            <Breadcrumb.Item>{address}</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
                            {/* <Routes>
                                <Route exact path="/" element={<Home />} />
                                <Route path="/my" element={<NFTmine />} />
                                <Route path="/listed" element={<NFTlist />} />
                                <Route path="/details" element={<NFTDetails />} />
                            </Routes> */}
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
                    {/* <Mint></Mint> */}
                </Layout>
            </Layout>
        </BrowserRouter>
    );
};

export default App;