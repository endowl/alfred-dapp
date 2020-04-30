import React, {Component, Fragment} from "react";
import {getStakedAmount} from "./utils/getStakedAmount";
import {streaming} from "./utils/streaming";
import StakingModal from "./StakingModal";
import {redeem} from "./utils/redeem";
import SimpleCard from "../../../@gull/components/cards/SimpleCard";
import {NotificationContainer} from "react-notifications";

class Stake extends Component {
    constructor(props) {
        super(props)
        this.state = {
            stakeDai: [
                {
                    leftIcon: "i-Money-2",
                    leftTitle: "120.00",
                    leftSubtitle: "staked",
                    rightIcon: "i-Financial",
                    rightTitle: "4.0210",
                    rightSubtitle: "Streaming"
                }
            ],
            stake: 0,
            rate: 0,
            modal: false,
        };

        this.getStake = this.getStake.bind(this)
        this.getStreaming = this.getStreaming.bind(this)
        this.redeem = this.redeem.bind(this)
    }

    getStake = () => {
        getStakedAmount()
            .then(
                res => this.setState({stake: res})
            ).catch(
            err => console.log("err:", err)
        )
    }

    getStreaming = () => {
        // streaming().then(
        //   res => console.log("streaming():", res)
        // )
        streaming()
        // .then(res => console.log("getStreaming response:",res))
            .then(res => this.setState({rate: res.toFixed(2) + "/yr"})
            ).catch(
            err => console.log("err:", err)
        )
    }

    redeem = () => {
        redeem()
    }

    componentDidMount() {
        this.getStake()

        this.getStreaming()

        console.log("state:", this.state)
    }

    render() {
        let {stakeDai = []} = this.state;
        // this.getStreaming();

        return (
            <Fragment>
                <NotificationContainer/>
                <SimpleCard title="Stake with rDAI and Donate Interest">
                    <div className="mb-4">
                        Put your money to work passively, a little goes a long way. Stake your Dai to help fund
                        Alfred.Estate's DeFi development efforts.
                    </div>
                    <div>
                        {stakeDai.map((card, index) => (
                            <Fragment>
                                <div className="row">
                                    <div className="cursor-pointer col-lg-3 col-md-6 col-sm-6"
                                         onClick={(e) => this.setState({modal: !this.state.modal})}>
                                        <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                            <div className="card-body text-center"><i className={card.leftIcon}></i>
                                                <div className="content"><p
                                                    className="text-muted mt-2 mb-0 text-capitalize">{card.leftSubtitle}</p>
                                                    <p
                                                        className="lead text-primary text-24 mb-2 text-capitalize">{this.state.stake && this.state.stake}&nbsp;Dai</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-md-6 col-sm-6">
                                        <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                            <div className="card-body text-center"><i className={card.rightIcon}></i>
                                                <div className="content"><p
                                                    className="text-muted mt-2 mb-0 text-capitalize">{card.rightSubtitle}</p>
                                                    <p
                                                        className="lead text-primary text-24 mb-2 text-capitalize">{this.state.rate && this.state.rate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/*<div key={index} className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", height: "76px"}}>*/}
                                {/*  <div className="card o-hidden" style={{display: "flex", flexDirection: "row"}}>*/}

                                {/*    <button className="card-body text-center" style={{padding: "4px"}}*/}
                                {/*            onClick={(e) => this.setState({modal: !this.state.modal})}>*/}
                                {/*      <i className={card.leftIcon}></i>*/}
                                {/*      <div>*/}
                                {/*        <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>*/}
                                {/*          {card.leftSubtitle}*/}
                                {/*        </p>*/}
                                {/*        <p className="lead text-primary text-capitalize">*/}
                                {/*          {this.state.stake && this.state.stake}*/}
                                {/*        </p>*/}
                                {/*      </div>*/}
                                {/*    </button>*/}

                                {/*    <button className="card-body text-center" style={{padding: "4px"}} onClick={(e) => {*/}
                                {/*      this.redeem()*/}
                                {/*    }}>*/}
                                {/*      <i className={card.rightIcon}></i>*/}
                                {/*      <div>*/}
                                {/*        <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>*/}
                                {/*          {card.rightSubtitle}*/}
                                {/*        </p>*/}
                                {/*        <p className="lead text-primary text-capitalize">*/}
                                {/*          {this.state.rate && this.state.rate}*/}
                                {/*        </p>*/}
                                {/*      </div>*/}
                                {/*    </button>*/}

                                {/*  </div>*/}
                                {/*</div>*/}
                            </Fragment>
                        ))}
                    </div>
                </SimpleCard>

                {this.state.modal && <StakingModal/>}


            </Fragment>
        );
    }
}

export default Stake;
