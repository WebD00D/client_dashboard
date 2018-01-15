import * as allActions from "./allActions";


// AUTHENTICATION ..

export function createNewUser(userid, email, publication) {
  return { type: allActions.CREATE_NEW_USER, userId: userid , email: email, publication: publication };
}

export function setCurrentUser(userid, email, publication, billingInfoSetup, paypal, mailing) {
  return { type: allActions.SET_CURRENT_USER, userId: userid , email: email, publication: publication, billingInfoSetup: billingInfoSetup, paypal: paypal, mailing: mailing };
}

export function addBillingInfo(userid, paypalEmail, mailingAddress) {
  return { type: allActions.ADD_BILLING_INFO, userid: userid, paypalEmail: paypalEmail, mailingAddress: mailingAddress };
}

export function setSlugs(slugs) {
  return { type: allActions.SET_SLUGS, slugs: slugs };
}

export function signoutUser() {
  return { type: allActions.SIGNOUT_USER };
}

// THE 3 FUNCTIONS BELOW ARE JUST SAMPLES AND USED FOR REFERENCE..

export function changePublicationName(pubname) {
  return { type: allActions.CHANGE_PUBLICATION_NAME, name: pubname };
}

export function receiveStuff(data) {
  return { type: allActions.RECEIVE_STUFF, stuff: data };
}

export function fetchStuff() {
  return dispatch => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(response =>
        response.json().then(data => ({
          data: data,
          status: response.status
        }))
      )
      .then(response => {
        if (response.status === 200) {
          dispatch(receiveStuff(response.data));
        } else {
          var flash = {
            type: "error",
            title: "Error getting task list",
            content:
              "There was an error getting the task list. Please try again."
          };
          dispatch({ type: "DISPLAY_FLASH", data: flash });
        }
      });
  };
}
