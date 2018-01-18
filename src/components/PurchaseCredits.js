import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

import CreditCardForm from "./CreditCardForm";

import { Elements } from "react-stripe-elements";

class PurchaseCredits extends Component {
  constructor(props) {
    super(props);

    this.checkout = this.checkout.bind(this);
    this.saveCustomerCard = this.saveCustomerCard.bind(this);

    this.state = {
      publicationName: "",
      loginEmailAddress: "",
      paypal: "",
      mailingAddress: "",
      accountErrorMessage: "",
      passResetText: "I want to change my password"
    };
  }

  checkout(chargeId) {
    // update the user to have $5.00 in credit...
    // store stripe customer id...
    // store transaction history..
    // authentication_userId

    var credits_remaining = 0;

    if (this.props.library.credits) {
      credits_remaining = this.props.library.credits;
    }

    var updates = {};
    updates[`readers/${this.props.library.userId}/credits`] =
      5 + credits_remaining;
    updates[
      `readers/${this.props.library.userId}/charges/${chargeId}/date`
    ] = Date.now();

    fire
      .database()
      .ref()
      .update(updates);

      fire
        .database()
        .ref("readers/" + this.props.library.userId)
        .once("value")
        .then(
          function(snapshot) {
            console.log("CLIENT USER", snapshot.val());
            this.props.libraryActions.setCurrentUser(
              this.props.library.userId,
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

        this.setState({
          accountErrorMessage: "Successfully added $5 to your account!"
        })
  }

  saveCustomerCard(customerId) {
    alert(customerId);
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
          {this.props.library.stripeCustomerId ? (
            <div>One Click Purchase</div>
          ) : (
            <div>
              <Elements>
                <CreditCardForm
                  handlePaymentIssue={() => {
                    this.setState({
                      accountErrorMessage:
                        "Something went wrong with your payment. Make sure all fields are completed, and card is valid."
                    });
                  }}
                  readerName={this.props.library.name}
                  readerEmail={this.props.library.email}
                  handleCheckout={chargeId => this.checkout(chargeId)}
                  saveCustomer={customerId => this.saveCustomerCard(customerId)}
                />
              </Elements>
            </div>
          )}
        </div>
        {this.state.accountErrorMessage}
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
