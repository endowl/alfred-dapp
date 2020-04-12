import React, { Component, Fragment } from "react";

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

    return (
      <Fragment>

        <div >
          {stakeDai.map((card, index) => (
            <div key={index} className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", height: "76px"}}>
              <div className="card o-hidden" style={{display: "flex", flexDirection: "row"}}>

                <button className="card-body text-center" style={{padding: "4px"}}>
                  <i className={card.leftIcon}></i>
                  <div >
                    <p className="text-muted text-capitalize" style={{marginBottom: "0px"}}>
                      {card.leftSubtitle}
                    </p>
                    <p className="lead text-primary text-capitalize">
                      {card.leftTitle}
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


      </Fragment>
    );
  }
}

export default Stake;
