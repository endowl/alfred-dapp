import React, { Component, Fragment } from "react";

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

        <div >
          
            <div className="col-lg-6 col-md-6 col-sm-6" style={{display: "flex", height: "76px"}}>
              <div className="card o-hidden" style={{display: "flex", flexDirection: "column"}}>
                <label>How much Dai would you like to stake?
                  <input onChange={this.handleChange}/>
                </label>
                <button className="card-body text-center" style={{padding: "4px"}} onClick={(e)=>alert(`called stake(${this.state.dai})`)}>
                  Stake it!
                </button>
              </div>
            </div>
        </div>


      </Fragment>
    );
  }
}

export default StakeModal;