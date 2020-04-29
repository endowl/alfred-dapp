import React, { Component, Fragment } from "react";
import { getStakedAmount } from "./utils/getStakedAmount";
import { streaming } from "./utils/streaming";
import StakingModal from "./StakingModal";
import { redeem } from "./utils/redeem";

class Stake extends Component {
  constructor(props){
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
      err => console.log("err:",err)
    )
  }

  getStreaming = () => {
    console.log("streaming():", streaming())
    streaming()
    .then(res => console.log("getStreaming response:",res))
    .then(res => this.setState({rate: res})
    ).catch(
      err => console.log("err:",err)
    )
  }

  redeem = () => {
    redeem()
  }

  componentDidMount(){
    this.getStake()
    
    this.getStreaming()

    console.log("state:",this.state)
  }

  render() {
    let { stakeDai = [] } = this.state;
    // this.getStreaming();

    return (
      <Fragment>

        <div >
          {stakeDai.map((card, index) => (
            <div key={index} className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", height: "76px"}}>
              <div className="card o-hidden" style={{display: "flex", flexDirection: "row"}}>

                <button className="card-body text-center" style={{padding: "4px"}} onClick={(e)=>this.setState({modal: !this.state.modal})}>
                  <i className={card.leftIcon}></i>
                  <div >
                    <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>
                      {card.leftSubtitle}
                    </p>
                    <p className="lead text-primary text-capitalize">
                      {this.state.stake && this.state.stake}
                    </p>
                  </div>
                </button>

                <button className="card-body text-center" style={{padding: "4px"}} onClick={(e)=>{this.redeem()}}>
                  <i className={card.rightIcon}></i>
                  <div >
                    <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>
                      {card.rightSubtitle}
                    </p>
                    <p className="lead text-primary text-capitalize">
                      {this.state.rate && this.state.rate}
                    </p>
                  </div>
                </button>

              </div>
            </div>
          ))}
        </div>

        {this.state.modal && <StakingModal/>}


      </Fragment>
    );
  }
}

export default Stake;
