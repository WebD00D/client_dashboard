import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this._handleAccountSignIn = this._handleAccountSignIn.bind(this);
    this._handleAccountCreation = this._handleAccountCreation.bind(this);

    this._handleAuthentication = this._handleAuthentication.bind(this);

    this.state = {
      email: "",
      password: "",
      hasError: false,
      errorMessage: "",
      buttonText: "Login",
      signingIn: true,
      signingUp: false,
      helpText: "Forgot password?",
      publicationName: "",
      accountEmail: "",
      email: "",
      password: "",
      forgotPass: false
    };
  }

  _handleAccountSignIn() {
    fire
      .auth()
      .signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(
        function(user) {
          fire
            .database()
            .ref("publications/" + user.uid)
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
                  user.uid,
                  snapshot.val().email,
                  snapshot.val().publication,
                  snapshot.val().billingInfoSetup,
                  paypalEmail,
                  mailingAddress
                );
              }.bind(this)
            );

          fire
            .database()
            .ref(`slugs/${user.uid}`)
            .once("value")
            .then(
              function(slugs) {
                this.props.libraryActions.setSlugs(slugs.val());
              }.bind(this)
            );

          this.setState({
            loading: false,
            hasError: false
          });
        }.bind(this)
      )
      .catch(
        function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;

          this.setState({
            errorMessage,
            loading: false,
            hasError: true
          });

          // ...
        }.bind(this)
      );
  }

  _handleAccountCreation() {
    fire
      .auth()
      .createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(
        function(user) {
          const newUser = fire.auth().currentUser;

          this.props.libraryActions.createNewUser(
            user.uid,
            this.state.email,
            this.state.publicationName
          );

          this.setState({
            loading: false,
            hasError: false
          });

          // WILL NEED TO HIT AN API TO SEND WELCOME EMAIL. ( using PostMark ) ...
        }.bind(this)
      )
      .catch(
        function(error) {
          // handle errors.
          const errorCode = error.code;
          const errorMessage = error.message;

          this.setState({
            errorMessage: errorMessage,
            loading: false,
            hasError: true
          });
        }.bind(this)
      );
  }

  _handleAuthentication() {
    this.setState({
      loading: true
    });

    if (this.state.forgotPass) {
      const accountEmail = this.state.email;
      var auth = fire.auth();

      auth
        .sendPasswordResetEmail(accountEmail)
        .then(
          function() {
            this.setState({
              loading: false,
              hasError: false,
              errorMessage: "",
              forgotPass: false,
              helpText: "Forgot password?",
              buttonText: "Login"
            });
          }.bind(this)
        )
        .catch(
          function(error) {
            this.setState({
              loading: false,
              hasError: true,
              errorMessage: error.message
            });
          }.bind(this)
        );
    } else {
      this.state.signingIn
        ? this._handleAccountSignIn()
        : this._handleAccountCreation();
    }
  }

  render() {
    return (
      <div className="App">
        {this.state.hasError ? (
          <div
            style={{
              position: "absolute",
              color: "#FFFFFF",
              backgroundColor: "#C0392B",
              fontFamily: "basic-sans",
              width: "100%",
              top: "0px",
              height: "32px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1
            }}
          >
            {this.state.errorMessage}
          </div>
        ) : (
          ""
        )}

        {this.state.loading ? (
          <div className="loader-wrap">
            <div className="loader">Loading...</div>
          </div>
        ) : (
          ""
        )}

        <div className="login">
          <div className="login-form">
            <div
              style={{
                marginBottom: "12px",
                fontWeight: "600",
                textAlign: "left",
                color: "#000000",
                fontSize: "36px",
                fontFamily: "basic-sans"
              }}
            >
              The Library
            </div>
            <div
              style={{
                marginBottom: "24px",
                textAlign: "left",
                color: "#000000",
                fontSize: "19px",
                fontFamily: "karmina"
              }}
            >
              {!this.state.forgotPass ? (
                <div>
                  {this.state.signingUp
                    ? "Signup for a publisher account"
                    : "  Login to your publisher dashboard"}
                </div>
              ) : (
                "Enter your account email, and we'll send a reset link."
              )}
            </div>

            {this.state.signingUp ? (
              <div className="login-input-wrap">
                <div className="login-input__icon">
                  <img src={require("../images/icons8-magazine-50.png")} />
                </div>
                <div className="login-input__input">
                  <input
                    onChange={e =>
                      this.setState({ publicationName: e.target.value })
                    }
                    placeholder="Publication name"
                    type="text"
                  />
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="login-input-wrap">
              <div className="login-input__icon">
                <img src={require("../images/icons8-customer-50.png")} />
              </div>
              <div className="login-input__input">
                <input
                  onChange={e => this.setState({ email: e.target.value })}
                  placeholder="Email address"
                  type="text"
                />
              </div>
            </div>

            {!this.state.forgotPass ? (
              <div className="login-input-wrap">
                <div className="login-input__icon">
                  <img src={require("../images/icons8-key-50.png")} />
                </div>
                <div className="login-input__input">
                  <input
                    onChange={e => this.setState({ password: e.target.value })}
                    placeholder="Password"
                    type="password"
                  />
                </div>
              </div>
            ) : (
              ""
            )}

            <div className="login-action-wrap">
              <a
                onClick={() => {
                  if (this.state.forgotPass) {
                    this.setState({
                      forgotPass: false,
                      helpText: "Forgot password?",
                      buttonText: "Login",
                      errorMessage: "",
                      hasError: false
                    });
                  } else {
                    this.setState({
                      forgotPass: true,
                      helpText: "Nevermind, I remember now",
                      buttonText: "Send",
                      errorMessage: "",
                      hasError: false
                    });
                  }
                }}
                className="help-link"
                href="#"
              >
                {this.state.helpText}
              </a>
              <button onClick={() => this._handleAuthentication()}>
                {this.state.buttonText}
              </button>
            </div>

            {this.state.signingIn ? (
              <a
                href="#"
                onClick={() =>
                  this.setState({
                    signingIn: false,
                    signingUp: true,
                    buttonText: "Sign Up",
                    helpText: "",
                    errorMessage: "",
                    hasError: false
                  })
                }
                className="other-action-link"
              >
                Don't have a publisher's account?
              </a>
            ) : (
              <a
                href="#"
                onClick={() =>
                  this.setState({
                    signingIn: true,
                    signingUp: false,
                    buttonText: "Login",
                    helpText: "Forgot password?",
                    errorMessage: "",
                    hasError: false
                  })
                }
                className="other-action-link"
              >
                I've already got an account.
              </a>
            )}
          </div>{" "}
          {/* end login form */}
          <div className="login-background">
            <div
              style={{
                fontWeight: "600",
                textAlign: "left",
                color: "#FFFFFF",
                fontSize: "66px",
                fontFamily: "basic-sans",
                letterSpacing: "1px"
              }}
            >
              Preserving the true <br /> art of storytelling.
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "50px",
                left: "40px",
                fontFamily: "sans",
                color: "#FFFFFF",
                fontSize: "18px",
                letterSpacing: ".25px",
                fontFamily: "karmina"
              }}
            >
              The Library's Publisher Dashboard
            </div>
          </div>
        </div>

        <div
          style={{
            display: "none",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
            marginTop: "60px",
            textAlign: "left",
            backgroundColor: "#FFFFFF",
            borderRadius: "4px",
            position: "relative"
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                height: "60px",
                width: "400px",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#000000",
                alignItems: "center",
                position: "absolute",
                borderTopLeftRadius: "4px",
                borderTopRightRadius: "4px"
              }}
            >
              <div style={{ paddingLeft: "20px" }}>
                <div style={{ fontWeight: "400", color: "#FFFFFF" }}>
                  The Library
                </div>
              </div>

              <div style={{ paddingRight: "20px" }}>
                <div
                  style={{
                    fontWeight: "400",
                    color: "#FFFFFF",
                    opacity: "0.5",
                    fontSize: "12px"
                  }}
                >
                  Publisher's Dashboard
                </div>
              </div>
            </div>

            <div
              style={{
                paddingLeft: "40px",
                paddingRight: "40px",
                paddingTop: "100px",
                paddingBottom: "40px",
                display: "flex",
                flexDirection: "column"
              }}
            >
              <label
                style={{
                  marginBottom: "8px",
                  fontSize: "10px",
                  letterSpacing: ".75px"
                }}
              >
                EMAIL
              </label>
              <input
                onChange={e => {
                  this.setState({ email: e.target.value });
                }}
                className="form-input"
                type="textbox"
              />

              <label
                style={{
                  marginBottom: "8px",
                  fontSize: "10px",
                  letterSpacing: ".75px"
                }}
              >
                PASSWORD
              </label>
              <input
                onChange={e => {
                  this.setState({ password: e.target.value });
                }}
                className="form-input"
                type="password"
              />

              <button
                className="login-button login-button--black"
                style={{ marginTop: "22px" }}
              >
                Sign In
              </button>

              <div className="or">
                <div className="or__line" />
                <div className="or__word">or</div>
              </div>

              <button
                onClick={() => this._handleAccountCreation()}
                className="login-button login-button--white"
                style={{ marginTop: "28px" }}
              >
                Create Account
              </button>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
