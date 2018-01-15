import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";
import "../Dashboard.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";
import cx from "classnames";
import _ from "lodash";
import moment from "moment";

import Account from "./Account";
import HelpDesk from "./HelpDesk";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this._handleBillingSetup = this._handleBillingSetup.bind(this);
    this._handleContentAddition = this._handleContentAddition.bind(this);
    this._updateActiveContent = this._updateActiveContent.bind(this);
    this._handleContentDeletion = this._handleContentDeletion.bind(this);
    this._handleEditFormOpen = this._handleEditFormOpen.bind(this);
    this._handleContentEditing = this._handleContentEditing.bind(this);
    this._handleSignOut = this._handleSignOut.bind(this);

    this.state = {
      activeTab: "Content",

      paypalEmail: "",
      billingAddress: "",
      initialPayoutOptionSaved: false, // change back to false..
      email: "",
      password: "",
      hasError: false,
      errorMessage: "",
      buttonText: "Login",
      signingIn: true,
      signingUp: false,
      helpText: "Forgot password?",
      publicationName: "",
      email: "",
      password: "",
      loading: false,
      contentURL: "",

      addingNewContent: false,
      newContentPrice: "Select a Price",
      newContentSlug: "",
      newContentAudioURL: "",

      editKey: "",
      editSlug: "",
      editPrice: "",
      editAudio: "",
      editActive: false,
      editFormOpen: false,

      editedContentSlug: "",
      editedContentPrice: "",
      editedContentAudioURL: "",
      editedErrorMessage: "",
    };
  }

  _handleSignOut() {
    this.props.libraryActions.signoutUser();
  }

  _handleContentEditing() {
    if (!this.state.editSlug.trim() && !this.state.editedContentSlug.trim()) {
      this.setState({
        editedErrorMessage: "A valid slug is required"
      });
      return;
    }

    if (!this.state.editPrice.trim() && !this.state.editedContentPrice.trim()) {
      this.setState({
        editedErrorMessage: "A valid price is required"
      });
      return;
    }

    let slugToUse;
    let priceToUse;
    let audioToUse;

    if (!this.state.editedContentSlug.trim()) {
      slugToUse = this.state.editSlug;
    } else {
      slugToUse = this.state.editedContentSlug;
    }

    if (!this.state.editedContentPrice.trim()) {
      priceToUse = this.state.editPrice;
    } else {
      priceToUse = this.state.editedContentPrice;
    }

    if (!this.state.editedContentAudioURL.trim()) {
      audioToUse = this.state.editAudio;
    } else {
      audioToUse = this.state.editedContentAudioURL;
    }

    var updates = {};
    updates[
      `slugs/${this.props.library.publicationId}/${this.state.editKey}/slug`
    ] = slugToUse;
    updates[
      `slugs/${this.props.library.publicationId}/${this.state.editKey}/price`
    ] = priceToUse;
    updates[
      `slugs/${this.props.library.publicationId}/${this.state.editKey}/audio`
    ] = audioToUse;

    fire
      .database()
      .ref()
      .update(updates);

    fire
      .database()
      .ref(`slugs/${this.props.library.publicationId}`)
      .once("value")
      .then(
        function(slugs) {
          this.props.libraryActions.setSlugs(slugs.val());
        }.bind(this)
      );

    this.setState({
      editFormOpen: false
    });
  }

  _handleEditFormOpen(key, slug, price, audio, isActive) {
    this.setState({
      editKey: key,
      editSlug: slug,
      editPrice: price,
      editActive: isActive,
      editAudio: audio,
      editFormOpen: true
    });
  }

  _handleContentDeletion(key) {
    fire
      .database()
      .ref(`slugs/${this.props.library.publicationId}/${key}`)
      .remove();

    fire
      .database()
      .ref(`slugs/${this.props.library.publicationId}`)
      .once("value")
      .then(
        function(slugs) {
          this.props.libraryActions.setSlugs(slugs.val());
        }.bind(this)
      );
  }

  _handleContentAddition() {
    const publisherId = this.props.library.publicationId;
    const dateId = Date.now();

    var updates = {};
    updates[`slugs/${publisherId}/${dateId}/slug`] = this.state.newContentSlug;
    updates[
      `slugs/${publisherId}/${dateId}/price`
    ] = this.state.newContentPrice;
    updates[`slugs/${publisherId}/${dateId}/audio`] = this.state.newContentAudioURL;
    updates[`slugs/${publisherId}/${dateId}/active`] = false;

    fire
      .database()
      .ref()
      .update(updates);

    fire
      .database()
      .ref(`slugs/${publisherId}`)
      .once("value")
      .then(
        function(slugs) {
          this.props.libraryActions.setSlugs(slugs.val());
        }.bind(this)
      );

    this.setState({
      addingNewContent: false,
      newContentPrice: "Select a Price"
    });
  }

  _handleBillingSetup() {
    const sendCheckToAddress = this.state.billingAddress;
    const paypalEmail = this.state.paypalEmail;

    // ..In firebase we're going to always be updating .. currentPayoutMethod..
    // ..We can also be saving / creating / updating endpoints for paypalEmail, and mailingAddress..
    // ..First thing is to check to make sure we've got at least one, and only one type filled out..

    if (!sendCheckToAddress.trim() && !paypalEmail.trim()) {
      this.setState({
        errorMessage: "A valid Paypal email or mailing address is required."
      });
      return;
    } else {
      // at least one is filled out. But now we've got to make sure it's only one.
      if (sendCheckToAddress.trim() && paypalEmail.trim()) {
        this.setState({
          errorMessage: "Please complete only one payout option."
        });
        return;
      } else {
        // update firebase here, and update props..

        this.props.libraryActions.addBillingInfo(
          this.props.library.publicationId,
          this.state.paypalEmail,
          this.state.billingAddress
        );

        return;
        this.setState({
          errorMessage: "",
          initialPayoutOptionSaved: true
        });
      }
    }
  }

  _updateActiveContent(isCurrentlyActive, key) {
    let active;
    isCurrentlyActive ? (active = false) : (active = true);

    var updates = {};
    updates[`slugs/${this.props.library.publicationId}/${key}/active`] = active;

    fire
      .database()
      .ref()
      .update(updates);

    fire
      .database()
      .ref(`slugs/${this.props.library.publicationId}`)
      .once("value")
      .then(
        function(slugs) {
          this.props.libraryActions.setSlugs(slugs.val());
        }.bind(this)
      );
  }

  render() {
    let slugListToDisplay;

    if (!this.props.library.slugs || this.props.library.slugs.length == 0) {
      slugListToDisplay = (
        <div className="publisher-content__row">
          <div className="slug">No content has been added!</div>
        </div>
      );
    } else {
      const slugs = this.props.library.slugs;
      slugListToDisplay = Object.keys(this.props.library.slugs).map(
        function(key) {
          const isActive = slugs[key].active;

          return (
            <div key={key} className="publisher-content__row">
              <div className="date-added">
                {" "}
                {moment.unix(key / 1000).format("MM/DD/YY")}
              </div>
              <div className="slug">{slugs[key].slug}</div>
              <div className="audio">{slugs[key].audio}</div>
              <div className="price">{slugs[key].price}</div>
              <div className="is-active">
                <input
                  className="styled-checkbox"
                  id={key}
                  type="checkbox"
                  checked={isActive}
                  onChange={() => this._updateActiveContent(isActive, key)}
                />
                <label htmlFor={key} />
              </div>
              <i
                onClick={() =>
                  this._handleEditFormOpen(
                    key,
                    slugs[key].slug,
                    slugs[key].price,
                    slugs[key].audio,
                    isActive
                  )
                }
                className="fa fa-pencil-square-o edit-content"
              />
              <i
                onClick={() => this._handleContentDeletion(key)}
                className="fa fa-close delete-content"
              />
            </div>
          );
        }.bind(this)
      );
    }

    return (
      <div className="App">
        <div className="dashboard">
          <div className="dashboard__nav">
            <div
              style={{
                color: "#252525",
                fontFamily: "basic-sans",
                fontSize: "30px",
                fontWeight: "700",
                paddingLeft: "40px"
              }}
            >
              The Library
            </div>
            <div
              style={{
                color: "#252525",
                fontFamily: "basic-sans",
                fontSize: "20px",
                fontWeight: "400",
                paddingRight: "40px"
              }}
            >
              {this.props.library.publication}
            </div>
          </div>
          <div className="dashboard__body">
            <div className="dashboard__menu">
              <div
                onClick={() => this.setState({ activeTab: "Content" })}
                className={cx([
                  "dashboard__menu-item",
                  {
                    "dashboard__menu-item--active":
                      this.state.activeTab === "Content"
                  }
                ])}
              >
                Content
              </div>
              <div
                onClick={() => this.setState({ activeTab: "Help" })}
                className={cx([
                  "dashboard__menu-item",
                  {
                    "dashboard__menu-item--active":
                      this.state.activeTab === "Help"
                  }
                ])}
              >
                Help Desk
              </div>
              <div
                onClick={() => this.setState({ activeTab: "Account" })}
                className={cx([
                  "dashboard__menu-item",
                  {
                    "dashboard__menu-item--active":
                      this.state.activeTab === "Account"
                  }
                ])}
              >
                My Account
              </div>
              <div
                onClick={() => this._handleSignOut()}
                className="dashboard__menu-item "
              >
                Sign Out
              </div>
            </div>

            {this.state.activeTab === "Content" &&
            this.state.addingNewContent ? (
              <div className="add-content-wrap">
                <div className="add-content-form">
                  <div className="add-content-title">Add Content</div>
                  <div
                    onClick={() => this.setState({ addingNewContent: false })}
                    style={{ position: "absolute", right: "40px", top: "40px" }}
                  >
                    <i className="fa fa-close" />
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-website-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <input
                        onChange={e =>
                          this.setState({ newContentSlug: e.target.value })
                        }
                        placeholder="Content Slug"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-money-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <select
                        onChange={e =>
                          this.setState({ newContentPrice: e.target.value })
                        }
                        className={cx({
                          "greyed-out":
                            this.state.newContentPrice === "Select a Price"
                        })}
                      >
                        <option>Select a Price</option>
                        <option>$0.20 USD</option>
                        <option>$0.30 USD</option>
                        <option>$0.40 USD</option>
                        <option>$0.50 USD</option>
                        <option>$0.60 USD</option>
                        <option>$0.70 USD</option>
                        <option>$0.80 USD</option>
                        <option>$0.90 USD</option>
                        <option>$1.00 USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-website-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <input
                        onChange={e =>
                          this.setState({ newContentAudioURL: e.target.value })
                        }
                        placeholder="Audio URL"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="login-action-wrap">
                    <button onClick={() => this._handleContentAddition()}>
                      Save
                    </button>
                  </div>

                  <div className="help-text">
                    Content slug should be formatted excluding the website url.{" "}
                    <br />
                    Ex: www.website.com/news/article-name{" "}
                    <i className="fa fa-long-arrow-right" /> /news/article-name
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {/* If billingInfoSetup is false, show them setup  */}
            {/* either add Paypal email, or addressee and address so we can send them a check */}

            {this.state.activeTab === "Content" &&
            !this.props.library.billingInfoSetup ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>
                      Welcome, {this.props.library.publication}!
                    </div>
                  </div>
                  <div className="dashboard__content-subtitle">
                    <div
                      style={{
                        paddingLeft: "40px",
                        opacity: 0.6,
                        marginTop: "12px"
                      }}
                    >
                      Before you get started, tell us how you'd like to get your
                      monthly payouts.
                    </div>
                  </div>

                  <div className="billing-options">
                    <div className="billing-option-label">
                      Send my funds via Paypal
                    </div>
                    <div
                      className="login-input-wrap"
                      style={{ marginBottom: "32px" }}
                    >
                      <div className="login-input__icon">
                        <img src={require("../images/icons8-paypal-50.png")} />
                      </div>
                      <div className="login-input__input">
                        <input
                          onChange={e =>
                            this.setState({ paypalEmail: e.target.value })
                          }
                          placeholder="Paypal email address"
                          type="text"
                        />
                      </div>
                    </div>

                    <div className="billing-option-label">
                      I'd like a check mailed to me
                    </div>
                    <div className="login-input-wrap">
                      <div className="login-input__icon">
                        <img
                          src={require("../images/icons8-check-book-50.png")}
                        />
                      </div>
                      <div className="login-input__input">
                        <input
                          onChange={e =>
                            this.setState({ billingAddress: e.target.value })
                          }
                          placeholder="Mailing address"
                          type="text"
                        />
                      </div>
                    </div>

                    <div className="login-action-wrap">
                      <button onClick={() => this._handleBillingSetup()}>
                        Save
                      </button>
                    </div>

                    <div className="billing-option-error">
                      {this.state.errorMessage}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {/* this part should only ever be shown once, after they complete their initia billing info stuff.. by default initialPayoutOptionSaved is false. */}

            {this.state.activeTab === "Content" &&
            this.props.library.billingInfoSetup &&
            this.state.initialPayoutOptionSaved ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>
                      Got it! Your payout info has been updated.
                    </div>
                  </div>
                  <div className="dashboard__content-subtitle">
                    <div
                      style={{
                        paddingLeft: "40px",
                        opacity: 0.6,
                        marginTop: "12px"
                      }}
                    >
                      Ready to add your first piece of content?
                    </div>
                  </div>
                  <div
                    className="login-action-wrap"
                    style={{
                      marginLeft: "40px",
                      marginTop: "12px",
                      borderBottom: "none"
                    }}
                  >
                    <button
                      onClick={() =>
                        this.setState({ initialPayoutOptionSaved: false })
                      }
                    >
                      Let's get to it
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Content" &&
            this.props.library.billingInfoSetup &&
            !this.state.initialPayoutOptionSaved ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>
                      Your Premium Content
                    </div>
                    <button
                      onClick={() => this.setState({ addingNewContent: true })}
                      className="dashboard__button"
                    >
                      Add New
                    </button>
                  </div>

                  <div className="publisher-content">
                    <div className="publisher-content__headline">
                      <div className="date-added">Date</div>
                      <div className="slug">Content URL</div>
                      <div className="audio">Audio</div>
                      <div className="price">Price</div>
                      <div className="is-active">Active</div>
                    </div>

                    {_.reverse(slugListToDisplay)}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Content" && this.state.editFormOpen ? (
              <div className="add-content-wrap">
                <div className="add-content-form">
                  <div className="add-content-title">Edit Content </div>
                  <div
                    onClick={() => this.setState({ editFormOpen: false })}
                    style={{ position: "absolute", right: "40px", top: "40px" }}
                  >
                    <i className="fa fa-close" />
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-website-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <input
                        onChange={e =>
                          this.setState({ editedContentSlug: e.target.value })
                        }
                        defaultValue={this.state.editSlug}
                        placeholder="Content Slug"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-money-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <select
                        onChange={e =>
                          this.setState({ editedContentPrice: e.target.value })
                        }
                        className={cx({
                          "greyed-out":
                            this.state.newContentPrice === "Select a Price"
                        })}
                        defaultValue={this.state.editPrice}
                      >
                        <option>Select a Price</option>
                        <option>$0.20 USD</option>
                        <option>$0.30 USD</option>
                        <option>$0.40 USD</option>
                        <option>$0.50 USD</option>
                        <option>$0.60 USD</option>
                        <option>$0.70 USD</option>
                        <option>$0.80 USD</option>
                        <option>$0.90 USD</option>
                        <option>$1.00 USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="login-input-wrap">
                    <div className="login-input__icon">
                      <img src={require("../images/icons8-website-50.png")} />
                    </div>
                    <div className="login-input__input">
                      <input
                        onChange={e =>
                          this.setState({ editedContentAudioURL: e.target.value })
                        }
                        defaultValue={this.state.editAudio}
                        placeholder="Audio URL"
                        type="text"
                      />
                    </div>
                  </div>

                  <div className="login-action-wrap">
                    <button onClick={() => this._handleContentEditing()}>
                      Save
                    </button>
                  </div>

                  <div className="help-text">
                    Content slug should be formatted excluding the website url.{" "}
                    <br />
                    Ex: www.website.com/news/article-name{" "}
                    <i className="fa fa-long-arrow-right" /> /news/article-name
                  </div>

                  <div className="billing-option-error">
                    {this.state.editedErrorMessage}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Account" ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>My Account</div>
                  </div>
                  <div style={{ paddingLeft: "40px" }}>
                    <Account />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Help" ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>Help Desk</div>
                  </div>
                  <div style={{ paddingLeft: "40px" }}>
                    <HelpDesk />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>{" "}
        {/* end dashboard */}
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
