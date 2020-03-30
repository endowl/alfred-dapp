import React, { Fragment } from "react";

const Footer = () => {
  return (
    <Fragment>
      <div className="flex-grow-1"></div>
      <div className="app-footer">
        <div className="row">
          <div className="col-md-9">
            <p>
              <strong>Alfred - Crypto Estate Planner - dApp Development Preview</strong>
            </p>
            <p>
              This dApp is still under active development. We suggest you restrict usage to the Ropsten testnet until the code is complete and has been fully audited. Thank you for your enthusiasm!
            </p>
          </div>
        </div>
        <div className="footer-bottom border-top pt-3 d-flex flex-column flex-sm-row align-items-center">
          <a
            className="btn btn-primary text-white btn-rounded"
            href="https://alfred.estate/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Return to home page
          </a>
          <span className="flex-grow-1"></span>
          <div className="d-flex align-items-center">
            <img className="logo" src="/assets/images/Mustache.png" alt="" />
            <div>
              <p className="m-0">&copy; 2020 Alfred Pennyworth, LLC</p>
              <p className="m-0">All rights reserved</p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Footer;
