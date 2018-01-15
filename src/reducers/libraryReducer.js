import initialState from "./initialState";
import fire from "../firebase";
import {
  FETCH_STUFF,
  RECEIVE_STUFF,
  CHANGE_PUBLICATION_NAME,
  CREATE_NEW_USER,
  SET_CURRENT_USER,
  ADD_BILLING_INFO,
  SET_SLUGS,
  SIGNOUT_USER
} from "../actions/allActions";

export default function library(state = initialState.library, action) {
  let newState;

  switch (action.type) {
    case CREATE_NEW_USER:
      fire
        .database()
        .ref("publications/" + action.userId)
        .set({
          userId: action.userId,
          email: action.email,
          publication: action.publication,
          billingInfoSetup: false
        });
      return {
        ...state,
        authenticated: true,
        email: action.email,
        publication: action.publication,
        publicationId: action.userId
      };

    case SET_CURRENT_USER:
      return {
        ...state,
        authenticated: true,
        email: action.email,
        accountEmail: action.email,
        publication: action.publication,
        publicationId: action.userId,
        billingInfoSetup: action.billingInfoSetup,
        paypalEmail: action.paypal,
        mailingAddress: action.mailing
      };

    case CHANGE_PUBLICATION_NAME:
      return {
        ...state,
        publication: action.name
      };

    case ADD_BILLING_INFO:
      var updates = {};
      updates[`publications/${action.userid}/billingInfoSetup`] = true;
      updates[`publications/${action.userid}/paypalEmail`] = action.paypalEmail;
      updates[`publications/${action.userid}/mailingAddress`] =
        action.mailingAddress;

      fire
        .database()
        .ref()
        .update(updates);

      return {
        ...state,
        billingInfoSetup: true
      };

    case SET_SLUGS:
      return {
        ...state,
        slugs: action.slugs
      };

    case SIGNOUT_USER:
      fire
        .auth()
        .signOut()
        .then(function() {}, function(error) {});

      return {
        ...state,
        authenticated: false
      };

    default:
      return state;
  }
}
