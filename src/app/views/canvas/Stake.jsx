import React, { Component, Fragment } from "react";
import { getStakedAmount } from "./utils/getStakedAmount";
import StakingModal from "./StakingModal";

class Stake extends Component {
  state = {
    stakeDai: [
      {
        leftIcon: "i-Money-2",
        leftTitle: "120.00",
        leftSubtitle: "staked",
        rightIcon: "i-Financial",
        rightTitle: "4.0210",
        rightSubtitle: "interest funded"
      }
    ]
  };

  render() {
    let { stakeDai = [] } = this.state;
    let stake = getStakedAmount()/*.then(res => res, err => err);*/
    console.log("getStakedAmount result:", stake);

    return (
      <Fragment>

        <div >
          {stakeDai.map((card, index) => (
            <div key={index} className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", height: "76px"}}>
              <div className="card o-hidden" style={{display: "flex", flexDirection: "row"}}>

                <button className="card-body text-center" style={{padding: "4px"}} onClick={(e)=>alert("call stake()")}>
                  <i className={card.leftIcon}></i>
                  <div >
                    <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>
                      {card.leftSubtitle}
                    </p>
                    <p className="lead text-primary text-capitalize">
                      {stake}
                    </p>
                  </div>
                </button>

                <button className="card-body text-center" style={{padding: "4px"}}>
                  <i className={card.rightIcon}></i>
                  <div >
                    <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>
                      {card.rightSubtitle}
                    </p>
                    <p className="lead text-primary text-capitalize">
                      {card.rightTitle}
                    </p>
                  </div>
                </button>

              </div>
            </div>
          ))}
        </div>

        <StakingModal/>


      </Fragment>
    );
  }
}

export default Stake;
