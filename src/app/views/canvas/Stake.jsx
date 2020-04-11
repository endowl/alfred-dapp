import React, { Component, Fragment } from "react";

class Stake extends Component {
  state = {
    cardList1: [
      {
        icon: "i-Financial",
        title: "4021",
        subtitle: "sales"
      },
      {
        icon: "i-Money-2",
        title: "120",
        subtitle: "expense"
      }
    ],
    stakeDai: [
      {
        leftIcon: "i-Money-2",
        leftTitle: "120",
        leftSubtitle: "staked",
        rightIcon: "i-Financial",
        rightTitle: "4021",
        rightSubtitle: "interest funded"
      }
    ]
  };

  render() {
    let { cardList1 = [], stakeDai = [] } = this.state;

    return (
      <Fragment>
        <div className="row">
          {cardList1.map((card, index) => (
            <div key={index} className="col-lg-3 col-md-6 col-sm-6">
              <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                <div className="card-body text-center">
                  <i className={card.icon}></i>
                  <div className="content">
                    <p className="text-muted mt-2 mb-0 text-capitalize">
                      {card.subtitle}
                    </p>
                    <p className="lead text-primary text-24 mb-2 text-capitalize">
                      {card.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          {stakeDai.map((card, index) => (
            <div key={index} className="col-lg-3 col-md-6 col-sm-6">
              <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">

                <div className="card-body text-center">
                  <i className={card.leftIcon}></i>
                  <div className="content">
                    <p className="text-muted mt-2 mb-0 text-capitalize">
                      {card.leftSubtitle}
                    </p>
                    <p className="lead text-primary text-24 mb-2 text-capitalize">
                      {card.leftTitle}
                    </p>
                  </div>
                </div>

                <div className="card-body text-center">
                  <i className={card.rightIcon}></i>
                  <div className="content">
                    <p className="text-muted mt-2 mb-0 text-capitalize">
                      {card.rightSubtitle}
                    </p>
                    <p className="lead text-primary text-24 mb-2 text-capitalize">
                      {card.rightTitle}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>


      </Fragment>
    );
  }
}

export default Stake;
