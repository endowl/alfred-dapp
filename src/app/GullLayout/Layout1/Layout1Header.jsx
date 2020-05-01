import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import { getTimeDifference } from "@utils";
import DropdownToggle from "react-bootstrap/DropdownToggle";
import { Link } from "react-router-dom";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  setLayoutSettings,
  setDefaultSettings
} from "app/redux/actions/LayoutActions";
import { logoutUser } from "app/redux/actions/UserActions";
import { withRouter } from "react-router-dom";

import { merge } from "lodash";
import MegaMenu from "@gull/components/MegaMenu";
import {useWallet} from "use-wallet";
import localStorageService from "../../services/localStorageService";

function WalletConnection() {
    const wallet = useWallet();
    return (
        <>

            {wallet.connected ? (
                <Dropdown>
                    <DropdownToggle as="span" className="toggle-hidden cursor-pointer">
                        <img
                            src="/assets/images/faces/3.jpg"
                            id="userDropdown"
                            alt=""
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        />
                    </DropdownToggle>
                    <DropdownMenu>
                        <div className="dropdown-header">
                            <i className="i-Lock-User mr-1"></i> {wallet.account}
                        </div>
                        <button className="dropdown-item cursor-pointer" onClick={() => {
                            wallet.deactivate();
                            localStorageService.setItem('connectWallet', false);
                        }}>
                            Disconnect
                        </button>
                    </DropdownMenu>
                </Dropdown>
            ) : (
                <Dropdown>
                    <DropdownToggle as="span" className="toggle-hidden cursor-pointer">
                        <img
                            src="/assets/images/faces/3.jpg"
                            id="userDropdown"
                            alt=""
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        />
                    </DropdownToggle>
                    <DropdownMenu>
                        <div className="dropdown-header">
                            <i className="i-Lock-User mr-1"></i> Not connected
                        </div>
                        <button className="dropdown-item cursor-pointer" onClick={() => {
                            wallet.activate();
                            localStorageService.setItem('connectWallet', true);
                            localStorageService.setItem('walletProvider', null);
                        }}>MetaMask
                        </button>
                        <button className="dropdown-item cursor-pointer" onClick={() => {
                            wallet.activate('frame');
                            localStorageService.setItem('connectWallet', true);
                            localStorageService.setItem('walletProvider', 'frame');
                        }}>Frame
                        </button>
                        <button className="dropdown-item cursor-pointer" onClick={() => {
                            wallet.activate('portis');
                            localStorageService.setItem('connectWallet', true);
                            localStorageService.setItem('walletProvider', 'portis');
                        }}>Portis
                        </button>
                    </DropdownMenu>
                </Dropdown>
            )}

        </>
    )
}

class Layout1Header extends Component {
  state = {
    shorcutMenuList: [],
    notificationList: [],
    showSearchBox: false
  };

  handleMenuClick = () => {
    let { setLayoutSettings, settings } = this.props;
    setLayoutSettings(
      merge({}, settings, {
        layout1Settings: {
          leftSidebar: {
            open: settings.layout1Settings.leftSidebar.secondaryNavOpen
              ? true
              : !settings.layout1Settings.leftSidebar.open,
            secondaryNavOpen: false
          }
        }
      })
    );
  };

  toggleFullScreen = () => {
    if (document.fullscreenEnabled) {
      if (!document.fullscreen) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  };

  handleSearchBoxOpen = () => {
    let { setLayoutSettings, settings } = this.props;
    setLayoutSettings(
      merge({}, settings, {
        layout1Settings: {
          searchBox: {
            open: true
          }
        }
      })
    );
  };

  render() {
    let { shorcutMenuList = [], notificationList = [] } = this.state;

    return (
      <div className="main-header">
        <div className="logo">
          <img src="/assets/images/A.png" alt="Alfred" />
        </div>

        <div className="menu-toggle" onClick={this.handleMenuClick}>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="d-none d-lg-flex align-items-center">
        </div>

        <div style={{ margin: "auto" }}></div>

        <div className="header-part-right">
          {/*<i className="i-Full-Screen header-icon d-none d-sm-inline-block" data-fullscreen onClick={this.toggleFullScreen}></i>*/}

          <div className="user col align-self-end">
            <WalletConnection/>
          </div>

        </div>
      </div>
    );
  }
}

Layout1Header.propTypes = {
  setLayoutSettings: PropTypes.func.isRequired,
  setDefaultSettings: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  setDefaultSettings: PropTypes.func.isRequired,
  setLayoutSettings: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired,
  user: state.user,
  settings: state.layout.settings
});

export default withRouter(
  connect(mapStateToProps, {
    setLayoutSettings,
    setDefaultSettings,
    logoutUser
  })(Layout1Header)
);
