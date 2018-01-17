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
      loginEmailAddress: "",
      accountErrorMessage: "",
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
              `readers/${this.props.library.userId}/email`
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



    this.setState({
      successMessage: "Account details saved!"
    });

    if (!this.state.accountErrorMessage.trim()) {

      fire
        .database()
        .ref("readers/" + user.uid)
        .once("value")
        .then(
          function(snapshot) {
            console.log("CLIENT USER", snapshot.val());
            this.props.libraryActions.setCurrentUser(
              user.uid,
              snapshot.val().stories,
              snapshot.val().signupDate,
              snapshot.val().name,
              snapshot.val().hasFreeStories,
              snapshot.val().freeStoriesRemaining,
              snapshot.val().email,
              snapshot.val().credits,
              snapshot.val().charges,
              snapshot.val().stripeCustomerId
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
              <img src={require("../images/icons8-email-filled-50.png")} />
            </div>
            <div className="login-input__input">
              <input
                onChange={e =>
                  this.setState({ loginEmailAddress: e.target.value })
                }
                placeholder="Login Email Address"
                defaultValue={this.props.library.email}
                type="text"
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
