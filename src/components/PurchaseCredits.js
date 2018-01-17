import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

class PurchaseCredits extends Component {
  constructor(props) {
    super(props);

    this.state = {
      publicationName: "",
      loginEmailAddress: "",
      paypal: "",
      mailingAddress: "",
      accountErrorMessage: "",
      passResetText: "I want to change my password"
    };
  }

  render() {
    return (
      <div>
        <div
          className="dashboard__content-subtitle"
          style={{ opacity: 0.5, marginTop: "0px" }}
        >
          Add another $5.00 to your account here.
        </div>
        <div style={{ marginTop: "25px" }}>
          <div>
            [ Stripe Payment Form if user doesn't have a stripe account ]
          </div>
          <div style={{marginBottom: '12px', marginTop: '12px'}}>or</div>
          <div> [ Button to click once and instantly get charged ] </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    library: state.library
  };
}

function mapDispatchToProps(dispatch) {
  return {
    libraryActions: bindActionCreators(libraryActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseCredits);
