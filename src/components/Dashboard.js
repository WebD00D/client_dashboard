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
import PurchaseCredits from "./PurchaseCredits";

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this._handleSignOut = this._handleSignOut.bind(this);
    this._handleRefund = this._handleRefund.bind(this);

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

      showRefundForm: false,
      refundReason_NotPremium: false,
      refundReason_TooMuch: false,
      refundReason_publisher: false,
      refundReason_author: false,
      refundReason_other: false,
      refundAmount: 0,
      refundStoryId: '',
      refundPublisherId: ''

    };
  }

  _handleRefund() {

    // put together reason for refund text
    let arrReason = [];
    this.state.refundReason_NotPremium ? arrReason.push("I don't consider this content premium") : "";
    this.state.refundReason_TooMuch ? arrReason.push("This wasn't worth the price I paid") : "";
    this.state.refundReason_publisher ? arrReason.push("I don't want to support this publisher anymore") : "";
    this.state.refundReason_author ? arrReason.push("I don't want to support this author anymore") : "";
    this.state.refundReason_other ? arrReason.push("Other") : "";

    let strReason = arrReason.join(" -- ");

    // Remove that story from their list of available stories..
    fire
      .database()
      .ref(`readers/${this.props.library.userId}/stories/${this.state.refundStoryId}`)
      .remove();

    // Add Refunded Node to the `slugs/publihserId/storyId` endpoint..

    const dateId = Date.now()

    var updates = {};
    updates[
      `slugs/${this.state.refundPublisherId}/${this.state.refundStoryId}/refunds/${dateId}/date`
    ] = Date.now();
    updates[
      `slugs/${this.state.refundPublisherId}/${this.state.refundStoryId}/refunds/${dateId}/reasons`
    ] = strReason;

    // Add the story price credit back to the users account..
    let creditsAfterRedund = (parseFloat(this.props.library.credits) + parseFloat(this.state.refundAmount)).toFixed(2);

    updates[
      `readers/${this.props.library.userId}/credits`
    ] = creditsAfterRedund;

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
            console.log("UPDATED CLIENT USER", snapshot.val());
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
          showRefundForm: false,
          refundReason_author: false,
          refundReason_publisher: false,
          refundReason_TooMuch: false,
          refundReason_NotPremium: false,
          refundReason_other: false
        })


  }

  _handleSignOut() {
    this.props.libraryActions.signoutUser();
  }



  render() {
    let slugListToDisplay;

    if (!this.props.library.stories || this.props.library.stories.length == 0) {
      slugListToDisplay = (
        <div className="publisher-content__row">
          <div className="slug">No stories purchased yet!!</div>
        </div>
      );
    } else {
      const slugs = this.props.library.stories;
      slugListToDisplay = Object.keys(this.props.library.stories).map(
        function(key) {
          return (
            <div key={key} className="publisher-content__row">
              <div className="date-added">
                {" "}
                {moment.unix(slugs[key].dateAccessed / 1000).format("MM/DD/YY")}
              </div>
              <div className="publisher">
               {slugs[key].publicationName}
              </div>
              <div className="slug">
                <a
                  target="_blank"
                  style={{ color: "#000000" }}
                  href={slugs[key].slug}
                >
                  {slugs[key].title}
                </a>
              </div>
              <div className="audio">
                {slugs[key].audio ? (
                  <a
                    target="_blank"
                    style={{ color: "#000000" }}
                    href={slugs[key].audio}
                  >
                    Listen
                  </a>
                ) : (
                  "n/a"
                )}{" "}
              </div>
              <div className="price">${slugs[key].pricePaid}</div>
              <div
                className="refund-content"
                onClick={() => this.setState({ showRefundForm: true, refundAmount: slugs[key].pricePaid, refundStoryId: key, refundPublisherId: slugs[key].publicationId  })}
              >
                <img style={{height: '20px'}} src={require("../images/icons8-refund-50.png")} />
              </div>
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
            className="dashboard__nav__title"
          >
            <img className="qc-logo" src={require("../images/welcome_logo.png")} />
          </div>
            <div
              style={{
                color: "#252525",
                fontFamily: "Nunito Sans",
                fontSize: "16px",
                fontWeight: "400",
                paddingRight: "40px",
                textAlign: "right"
              }}
            >
              <div style={{ textTransform: "capitalize" }}>
                {this.props.library.name}
              </div>
              <small style={{ color: "#A8A8A8" }}>
                ${parseFloat(
                  Math.round(this.props.library.credits * 100) / 100
                ).toFixed(2)}{" "}
                in credits
              </small>
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

            {this.state.showRefundForm ? (
              <div className="refund-form-wrap">
                <div className="refund-form">
                  <div className="refund-header">
                    <div className="refund-title">Refund this story?</div>
                    <i
                      onClick={() => this.setState({ showRefundForm: false })}
                      className="fa fa-close"
                    />
                  </div>
                  <div className="refund-byline">
                    Sorry you're unsatisfied with this story. Mind telling us
                    why?
                  </div>

                  <div style={{display: "flex"}}>
                    <input
                      className="styled-checkbox"
                      id="refund_notpremium"
                      type="checkbox"
                      onChange={() => {
                        this.setState({ refundReason_NotPremium: !this.state.refundReason_NotPremium });
                      }}
                    />
                    <label htmlFor="refund_notpremium" />
                    <div className="refund-reason">I didn't like the content</div>
                  </div>

                  <div style={{display: "flex"}}>
                    <input
                      className="styled-checkbox"
                      id="refund_toomuch"
                      type="checkbox"
                      onChange={() => {
                        this.setState({ refundReason_TooMuch: !this.state.refundReason_TooMuch });
                      }}
                    />
                    <label htmlFor="refund_toomuch" />
                    <div className="refund-reason">Wasn't worth the price I paid</div>
                  </div>

                  <div style={{display: "flex"}}>
                    <input
                      className="styled-checkbox"
                      id="refund_publisher"
                      type="checkbox"
                      onChange={() => {
                        this.setState({ refundReason_publisher: !this.state.refundReason_publisher });
                      }}
                    />
                    <label htmlFor="refund_publisher" />
                    <div className="refund-reason">I don't want to support this publisher </div>
                  </div>

                  <div style={{display: "flex"}}>
                    <input
                      className="styled-checkbox"
                      id="refund_author"
                      type="checkbox"
                      onChange={() => {
                        this.setState({ refundReason_author: !this.state.refundReason_author });
                      }}
                    />
                    <label htmlFor="refund_author" />
                    <div className="refund-reason">I don't want to support this author </div>
                  </div>

                  <div style={{display: "flex"}}>
                    <input
                      className="styled-checkbox"
                      id="refund_other"
                      type="checkbox"
                      onChange={() => {
                        this.setState({ refundReason_other: !this.state.refundReason_other });
                      }}
                    />
                    <label htmlFor="refund_other" />
                    <div className="refund-reason">Other </div>
                  </div>

                  <button style={{ marginTop: '22px' }} onClick={ () => this._handleRefund() } className="dashboard__button">Refund Story</button>


                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Content" ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div >
                      Your Premium Content
                    </div>
                  </div>

                  <div className="publisher-content">
                    <div className="publisher-content__headline">
                      <div className="date-added">Date</div>
                      <div className="publisher">Publisher</div>
                      <div className="slug">Title</div>
                      <div className="audio">Audio</div>
                      <div className="price">Price</div>
                    </div>

                    {_.reverse(slugListToDisplay)}
                  </div>

                  {/*<iframe
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameborder="no"
                    src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/383618459%3Fsecret_token%3Ds-xBU2W&amp;color=%234274e3&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true"
                  /> */}
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Account" ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div>My Account</div>
                  </div>
                  <div style={{ paddingLeft: "40px" }}>
                    <Account />
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}

            {this.state.activeTab === "Purchase" ? (
              <div className="dashboard__content">
                <div className="dashboard__block">
                  <div className="dashboard__content-title">
                    <div style={{ paddingLeft: "40px" }}>Buy More Credits</div>
                  </div>
                  <div style={{ paddingLeft: "40px" }}>
                    <PurchaseCredits />
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
