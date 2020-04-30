import React, { Component, Fragment } from "react";
import { stake } from "./utils/stake";
import { redeem } from "./utils/redeem";

class StakeModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      dai: 0,
    };

    this.handleChange = this.handleChange.bind(this);

  }

  handleChange(e) {
    this.setState({dai: e.target.value});
  }

  render() {

    return (
        <Fragment>

          <div>

            <div className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", XXheight: "76px"}}>
              <div className="card o-hidden" style={{display: "flex", flexDirection: "column"}}>
                <div className="card-body">
                  <label>How much Dai would you like to stake?
                    <input className="form-control" onChange={this.handleChange}/>
                  </label>
                  <div>
                  <button className="d-block w-100 my-2 text-capitalize btn btn-primary" XXclassName="XXXcard-body d-block text-center" style={{padding: "4px"}}
                          onClick={(e) => stake(this.state.dai)}>
                    Stake it!
                  </button>
                  </div>
                  <div>
                  <button className="d-block w-100 my-2 text-capitalize btn btn-primary" XXclassName="XXXcard-body d-block text-center" style={{padding: "4px"}} onClick={(e) => redeem()}>
                    Un-stake it!
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </Fragment>
    );
  }
}

export default StakeModal;