import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

class Account extends Component {
  constructor(props) {
    super(props);

    this._sendPasswordReset = this._sendPasswordReset.bind(this);

    this.state = {
      publicationName: "",
      loginEmailAddress: "",
      paypal: "",
      mailingAddress: "",
      accountErrorMessage: "",
      passResetText: "I want to change my password",
      successMessage: ""
    };
  }

  _handleAccountUpdates() {
    if (this.state.loginEmailAddress.trim()) {
      var user = fire.auth().currentUser;

      user
        .updateEmail(this.state.loginEmailAddress)
        .then(
          function() {
            var updates = {};
            updates[
              `publications/${this.props.library.publicationId}/email`
            ] = this.state.loginEmailAddress;

            fire
              .database()
              .ref()
              .update(updates);
          }.bind(this)
        )
        .catch(
          function(error) {
            // An error happened...
            this.setState({
              accountErrorMessage: error,
              successMessage: ""
            });
          }.bind(this)
        );
    }

    if (this.state.publicationName.trim()) {
      var pubNameUpdates = {};
      pubNameUpdates[
        `publications/${this.props.library.publicationId}/publication`
      ] = this.state.publicationName;

      fire
        .database()
        .ref()
        .update(pubNameUpdates);
    }

    if (this.state.paypal.trim()) {
      var paypalUpdates = {};
      paypalUpdates[
        `publications/${this.props.library.publicationId}/paypalEmail`
      ] = this.state.paypal;

      fire
        .database()
        .ref()
        .update(paypalUpdates);
    }

    if (this.state.mailingAddress.trim()) {
      var mailingUpdates = {};
      mailingUpdates[
        `publications/${this.props.library.publicationId}/mailingAddress`
      ] = this.state.mailingAddress;

      fire
        .database()
        .ref()
        .update(mailingUpdates);
    }

    this.setState({
      successMessage: "Account details saved!"
    });

    if (!this.state.accountErrorMessage.trim()) {
      fire
        .database()
        .ref("publications/" + this.props.library.publicationId)
        .once("value")
        .then(
          function(snapshot) {
            let paypalEmail;
            let mailingAddress;

            snapshot.val().paypalEmail
              ? (paypalEmail = snapshot.val().paypalEmail)
              : (paypalEmail = "");
            snapshot.val().mailingAddress
              ? (mailingAddress = snapshot.val().mailingAddress)
              : (mailingAddress = "");

            this.props.libraryActions.setCurrentUser(
              this.props.library.publicationId,
              snapshot.val().email,
              snapshot.val().publication,
              snapshot.val().billingInfoSetup,
              paypalEmail,
              mailingAddress
            );
          }.bind(this)
        );
    }
  } // end _handleAccountUpdates

  _sendPasswordReset() {
    const accountEmail = this.props.library.accountEmail;
    var auth = fire.auth();

    auth
      .sendPasswordResetEmail(accountEmail)
      .then(
        function() {
          // Email sent.
          this.setState({
            passResetText: `Password email send to ${
              this.props.library.accountEmail
            }!`
          });
        }.bind(this)
      )
      .catch(
        function(error) {
          // An error happened.
          this.setState({
            accountErrorMessage: error.message,
            successMessage: ""
          });
        }.bind(this)
      );
  }

  render() {
    return (
      <div>
        <div
          className="dashboard__content-subtitle"
          style={{ opacity: 0.5, marginTop: "12px" }}
        >
          View & update your account information
        </div>
        <div style={{ marginTop: "25px" }}>
          <div className="login-input-wrap">
            <div className="login-input__icon">
              <img src={require("../images/icons8-magazine-50.png")} />
            </div>
            <div className="login-input__input">
              <input
                onChange={e =>
                  this.setState({ publicationName: e.target.value })
                }
                placeholder="Publication Name"
                defaultValue={this.props.library.publication}
                type="text"
              />
            </div>
          </div>

          <div className="login-input-wrap">
            <div className="login-input__icon">
              <img src={require("../images/icons8-email-filled-50.png")} />
            </div>
            <div className="login-input__input">
              <input
                onChange={e =>
                  this.setState({ loginEmailAddress: e.target.value })
                }
                placeholder="Login Email Address"
                defaultValue={this.props.library.accountEmail}
                type="text"
              />
            </div>
          </div>

          <div className="login-input-wrap">
            <div className="login-input__icon">
              <img src={require("../images/icons8-paypal-50.png")} />
            </div>
            <div className="login-input__input">
              <input
                onChange={e => this.setState({ paypal: e.target.value })}
                placeholder="Paypal Email Address"
                type="text"
                defaultValue={this.props.library.paypalEmail}
              />
            </div>
          </div>

          <div className="login-input-wrap">
            <div className="login-input__icon">
              <img src={require("../images/icons8-check-book-50.png")} />
            </div>
            <div className="login-input__input">
              <input
                onChange={e =>
                  this.setState({ mailingAddress: e.target.value })
                }
                placeholder="Mailing Address"
                type="text"
                defaultValue={this.props.library.mailingAddress}
              />
            </div>
          </div>

          <div
            className="send-pass-reset"
            onClick={() => this._sendPasswordReset()}
          >
            {this.state.passResetText}
          </div>

          <div className="login-action-wrap">
            <button onClick={() => this._handleAccountUpdates()}>Save</button>
          </div>

          <div className="billing-option-error">
            {this.state.accountErrorMessage && !this.state.successMessage.trim()
              ? this.state.accountErrorMessage
              : ""}
          </div>
          <div className="billing-option-success">
            {this.state.successMessage && !this.state.accountErrorMessage.trim()
              ? this.state.successMessage
              : ""}
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Account);
