import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

import {
  injectStripe,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement
} from "react-stripe-elements";

class CreditCardForm extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      saveCard: false
    };
  }

  handleSubmit(ev) {
    ev.preventDefault();

    this.props.stripe
      .createToken({
        name: this.props.readerName || "n/a",
        email: this.props.readerEmail || "n/a"
      })
      .then(({ token }) => {
        console.log("Received Stripe token:", token);


        if (!token) {
          this.props.handlePaymentIssue();
          return;
        }

        if (this.state.saveCard) {

        fetch(`http://localhost:8081/create-customer?token=${token.id}`)
          .then(function(response) {
            return response.json();
          })
          .then(
            function(json) {
              console.log("parsed json response from api", json);
              const customerId = json.id;

              this.props.saveCustomer(customerId);

              // once customer is created.. then create the charge using the customer id..

              fetch(`http://localhost:8081/payment?token=${customerId}`)
                .then(function(response) {
                  return response.json();
                })
                .then(
                  function(json) {
                    console.log("parsed json response from api", json);
                    const chargeId = json.id;

                    if (json.status === "succeeded") {
                      console.log("PAYMENT WENT THROUGH!!!");
                      this.props.handleCheckout(chargeId);
                    }

                    if (json === "payment error") {
                      console.log("payment failed");

                      this.props.handlePaymentIssue();
                    }
                  }.bind(this)
                )
                .catch(
                  function(ex) {
                    console.log("parsing failed from api", ex);


                    this.props.handlePaymentIssue();
                  }.bind(this)
                );

            }.bind(this)
          )
          .catch(
            function(ex) {
              console.log("parsing failed from api", ex);


              this.props.handlePaymentIssue();
            }.bind(this)
          );

        } else {

          fetch(`http://localhost:8081/payment?token=${token.id}`)
            .then(function(response) {
              return response.json();
            })
            .then(
              function(json) {
                console.log("parsed json response from api", json);
                const chargeId = json.id;

                if (json.status === "succeeded") {
                  console.log("PAYMENT WENT THROUGH!!!");
                  this.props.handleCheckout(chargeId);
                }

                if (json === "payment error") {
                  console.log("payment failed");

                  this.props.handlePaymentIssue();
                }
              }.bind(this)
            )
            .catch(
              function(ex) {
                console.log("parsing failed from api", ex);
                this.props.handlePaymentIssue();
              }.bind(this)
            );
        }

      });
  }

  render() {
    return (
      <form id="cc-form" onSubmit={this.handleSubmit}>
        <div className="login-input-wrap">
          <div className="login-input__icon">
            <img src={require("../images/icons8-credit-card-50.png")} />
          </div>
          <div className="login-input__input login-input__input--cc">
            <CardNumberElement
              style={{
                base: {
                  width: "200px",
                  fontSize: "16px",
                  fontFamily: "basic-sans",
                  color: "#000000"
                }
              }}
            />
          </div>
        </div>
        <div className="login-input-wrap">
          <div className="login-input__icon">
            <img src={require("../images/icons8-date-from-50.png")} />
          </div>
          <div className="login-input__input login-input__input--cc">
            <CardExpiryElement
              style={{
                base: {
                  fontSize: "16px",
                  fontFamily: "basic-sans",
                  color: "#000000"
                }
              }}
            />
          </div>
        </div>
        <div className="login-input-wrap">
          <div className="login-input__icon">
            <img src={require("../images/icons8-security-lock-50.png")} />
          </div>
          <div className="login-input__input login-input__input--cc">
            <CardCVCElement
              style={{
                base: {
                  fontSize: "16px",
                  fontFamily: "basic-sans",
                  color: "#000000"
                }
              }}
            />
          </div>
        </div>
        <div className="login-input-wrap">
          <div className="login-input__icon">
            <img src={require("../images/icons8-postal-50.png")} />
          </div>
          <div className="login-input__input login-input__input--cc">
            <PostalCodeElement
              style={{
                base: {
                  fontSize: "16px",
                  fontFamily: "basic-sans",
                  color: "#000000"
                }
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex" }}>
          <input
            className="styled-checkbox"
            id="save-card"
            type="checkbox"
            checked={this.state.saveCard}
            onChange={() => this.setState({ saveCard: !this.state.saveCard })}
          />

          <label htmlFor="save-card" />
          <div>Save Card for Renewal</div>
        </div>

        <small>
          When your account balance falls under $1.00, we'll top you off with
          another $5.00.
        </small>

        <div className="login-action-wrap">
          <button style={{ width: "250px" }}>Confirm Purchase</button>
        </div>
        <img
          style={{ height: "30px" }}
          src="https://s3-us-west-1.amazonaws.com/stabmagazine/powered_by_stripe%403x.png"
        />
      </form>
    );
  }
}

export default injectStripe(CreditCardForm);
