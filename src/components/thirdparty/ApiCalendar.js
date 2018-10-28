import Config from "../../apiGoogleconfig.js";
import firebase from "firebase/app";
import "firebase/auth";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyBJxwyND_atKCKhKgdsLfldjeVVvZqsBFo",
    authDomain: "schedule1-d3f0f.firebaseapp.com",
    databaseURL: "https://schedule1-d3f0f.firebaseio.com",
    projectId: "schedule1-d3f0f",
    storageBucket: "schedule1-d3f0f.appspot.com",
    messagingSenderId: "712271184102" // Cloud Messaging
  });
}

class ApiCalendar {
  constructor() {
    this.sign = false;
    this.gapi = null;
    this.onLoadCallback = null;
    this.calendar = "primary";
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.initClient = this.initClient.bind(this);
    this.handleSignoutClick = this.handleSignoutClick.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
    this.listenSign = this.listenSign.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.setCalendar = this.setCalendar.bind(this);
    this.handleClientLoad();
  }

  grantOfflineAccess() {
    var googleUser = this.gapi.auth2.getAuthInstance().currentUser.get();
    this.gapi.auth2
      .getAuthInstance()
      .grantOfflineAccess()
      .then(() => {
        googleUser
          .reloadAuthResponse()
          .then(resp => {
            console.log(resp, resp.code);
          })
          .catch(err => {
            console.log(err);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Update connection status.
   * @param {boolean} isSignedIn
   */
  updateSigninStatus(isSignedIn) {
    var googleUser = this.gapi.auth2.getAuthInstance().currentUser.get();

    if (isSignedIn) {
      var idToken = googleUser.getAuthResponse().id_token;
      var creds = firebase.auth.GoogleAuthProvider.credential(idToken);
      firebase
        .auth()
        .signInAndRetrieveDataWithCredential(creds)
        .then(user => {
          var googleProfile = googleUser.getBasicProfile();
          this.sign = !!user;
          this.onLoadCallback(this.sign);
        })
        .catch(err => {
          this.sign = false;
          this.onLoadCallback(this.sign);
        });
    } else {
      firebase.auth().signOut();
      this.sign = false;
      this.onLoadCallback(this.sign);
    }
  }
  /**
   * Auth to the google Api.
   */
  initClient() {
    this.gapi = window["gapi"];
    this.gapi.client
      .init(Config)
      .then(() => {
        // Listen for sign-in state changes.
        this.gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen(this.updateSigninStatus);
        // Handle the initial sign-in state.
        this.updateSigninStatus(
          this.gapi.auth2.getAuthInstance().isSignedIn.get()
        );
        if (this.onLoadCallback) {
          this.onLoadCallback(this.sign);
        }
      })
      .catch(err => {
        console.log("init api error", err.toString());
      });
  }
  /**
   * Init Google Api
   * And create gapi in global
   */
  handleClientLoad() {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    document.body.appendChild(script);
    script.onload = () => {
      window["gapi"].load("client:auth2", this.initClient);
    };
  }
  /**
   * Sign in Google user account
   */
  handleAuthClick() {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().signIn();
    } else {
      console.log("Error: this.gapi not loaded");
    }
  }
  /**
   * Set the default attribute calendar
   * @param {string} newCalendar
   */
  setCalendar(newCalendar) {
    this.calendar = newCalendar;
  }
  /**
   * Execute the callback function when a user is disconnected or connected with the sign status.
   * @param callback
   */
  listenSign(callback) {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().isSignedIn.listen(callback);
    } else {
      console.log("Error: this.gapi not loaded");
    }
  }
  /**
   * Execute the callback function when gapi is loaded
   * @param callback
   */
  onLoad(callback) {
    if (this.gapi) {
      callback();
    } else {
      this.onLoadCallback = callback;
    }
  }
  /**
   * Sign out user google account
   */
  handleSignoutClick() {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().signOut();
    } else {
      console.log("Error: this.gapi not loaded");
    }
  }
}
const apiCalendar = new ApiCalendar();
export default apiCalendar;
