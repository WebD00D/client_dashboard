import React, { Component } from "react";
import ReactDOM from "react-dom";

import "../App.css";
import "../Login.css";

import fire from "../firebase";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as libraryActions from "../actions/libraryActions";
import PropTypes from "prop-types";

class HelpDesk extends Component {
  constructor(props) {
    super(props);

    this._sendPasswordReset = this._sendPasswordReset.bind(this);

    this.state = {
      publicationName: "",
      loginEmailAddress: "",
      paypal: "",
      mailingAddress: "",
      accountErrorMessage: "",
      passResetText: "I want to change my password"
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
              accountErrorMessage: error
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
            accountErrorMessage: error
          });
        }.bind(this)
      );
  }

  render() {
    return (
      <div>
        <div
          className="dashboard__content-subtitle"
          style={{ opacity: 0.5, marginTop: "0px" }}
        >
          Have questions? We've got answers.
        </div>
        <div style={{ marginTop: "25px" }}>
          <div className="question-block">
            <div className="question">Why do I need to use The Library?</div>
            <div className="answer">
              You don’t. Media is in a very tricky place, however. Once upon a
              time our models were a mix of advertising and reader contribution.
              Recently, most of us have lost the war to Google and Facebook. We
              spent thousands trying to build our audiences with them and now
              have to pay to turn them on. We all make mistakes, but can you
              believe some of us embedded entire Instant Articles in Facebook
              with the promise of healthy ad commissions? <br />
              <br />
              We can’t change the past but we can shape the future. And, that
              means to stay alive and thrive, we need to be self-funded and run
              our media businesses with a mix of advertising and reader
              contributions. And, if we were really honest with ourselves, we’d
              likely all choose to have our sites be pure and devoid of the
              clutter of advertising. <br />
              <br />
              Picture this, to those of us in print media: your most loyal
              reader subscribes to your print edition, or wanders down to the
              newsstand to pick up the latest issue. They sit back, consume the
              magazine and that afternoon, they go browsing the internet. Here,
              they find the cover story + main feature in its entirety,
              identical except for how it’s displayed: every word, every photo,
              every caption. Is this how we look after our most loyal customer?
            </div>
          </div>

          <div className="question-block">
            <div className="question">How should I price my story?</div>
            <div className="answer">
              The Library is about quality storytelling. It should be special.
              And, we suggest that stories should represent far more value than
              they are priced. Does a 20c story represent $1 value? The answer
              here is, of course, arbitrary. Our guiding principle is that we
              hope to create a platform that encourages quality and a very
              satisfied audience.
            </div>
          </div>

          <div className="question-block">
            <div className="question">How do I change the price?</div>
            <div className="answer">
              Simply sign back into the publisher’s dashboard and adjust
              accordingly. However, none of us like to pay for something only to
              see it cheaper moments later or days later. We suggest setting a
              price and honoring it with few changes.
            </div>
          </div>

          <div className="question-block">
            <div className="question">How do I add a new story?</div>
            <div className="answer">
              Share the URL on the Library dashboard and set your price, and
              select ACTIVE.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Is there a lag time between when the story is live and the paywall
              showing?
            </div>
            <div className="answer">
              Yes there is. If a story is live, the paywall won’t exist until
              it’s active on The Library dashboard. To have it live
              instantaneously with The Library paywall pop-up, load your story
              as a draft and share that URL on The Library dashboard. That way
              you’ll ensure the story always has a password.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              I want to include advertising on my story. How do I?
            </div>
            <div className="answer">
              Sorry, the Library exists to preserve the art of storytelling.
              It’s about a culturally ravenous audience investing in quality. No
              fluff, no ads. A skilled developer may try to get around our tech
              and insert a kind of advertising functionality. If so, we will
              rescind our software with you and you can revert to your old model
              without us.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Should I disable the paywall after a number of days?
            </div>
            <div className="answer">
              We encourage timeless and evergreen content behind the paywall.
              What we’re all trying to do is re-educate our audience that
              quality comes at a very fair price. If a story or publisher has an
              expiring paywall, it will encourage readers to wait until the
              paywall expires.
            </div>
          </div>

          <div className="question-block">
            <div className="question">How do I update my account details?</div>
            <div className="answer">
              Get back into the publisher’s dashboard, visit My Account, and
              adjust.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              I have a suggestions, who do I contact and how?
            </div>
            <div className="answer">
              Email us here or just call. Sam +1-949-446-5182; Christian
              +1-804-801-6177
            </div>
          </div>

          <div className="question-block">
            <div className="question">I found a bug, what can I do?</div>
            <div className="answer">
              Tell us! Please! And, thank you! We appreciate it!
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Can I deactivate the paywall on a story?
            </div>
            <div className="answer">
              Yes, but we would recommend that the story remains how you send it
              live.
            </div>
          </div>

          <div className="question-block">
            <div className="question">How do I delete a story?</div>
            <div className="answer">
              Deleting a story will happen in your own CMS not on The Library.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Does The Library and the paywall affect my google ranking?
            </div>
            <div className="answer">
              No, Google will pick up as usual. It’s google search ranking maybe
              affected however because it will receive a reduced number of
              views.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Can The Library put a full-time subscription paywall on my site?
            </div>
            <div className="answer">
              No, we want our audiences to feel guilty in the same way you do
              when you have a gym membership when you’re not using it enough. No
              one likes direct debits. We don’t do that here. We’re pay-by-play.
              The Library is a micro-paywall that allows you to buy the best
              media on your phone or desktop – without ads.{" "}
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              There are tiny conversions on my story, what am I doing wrong?
            </div>
            <div className="answer">
              No, we want our audiences to feel guilty in the same way you do
              when you have a gym membership when you’re not using it enough. No
              one likes direct debits. We don’t do that here. We’re pay-by-play.
              The Library is a micro-paywall that allows you to buy the best
              media on your phone or desktop – without ads.{" "}
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              There are tiny conversions on my story, what am I doing wrong?
            </div>
            <div className="answer">
              It is unlikely that income will rain down from the treetops first
              try. It’s a re-education process which will take some time but
              it’s a chance to identify your loyalists and create a
              micro-community of enthusiastic readers.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              How much does The Library software cost me?
            </div>
            <div className="answer">It's free.</div>
          </div>

          <div className="question-block">
            <div className="question">
              What commission does The Library take?
            </div>
            <div className="answer">
              The Library takes 10% of revenue. There are Stripe charges also
              associated.
            </div>
          </div>

          <div className="question-block">
            <div className="question">
              Will The Library piss my reader’s off?
            </div>
            <div className="answer">
              Your work has likely always been free. Now it’s not. This will
              almost certainly create concern with your readers. However, we’re
              challenging the status quo that all media is free. Which is a
              desperately unsustainable model. We’re about providing a platform
              to create the work we’re proud of. It’s not clickbait, it’s not a
              race to the bottom, it’s the work that represents us at our best.
              It’s for our loyalists.{" "}
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

export default connect(mapStateToProps, mapDispatchToProps)(HelpDesk);
