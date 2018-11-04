import { observable, action, computed } from "mobx"
import firebase from "firebase/app"
import "firebase/auth"
import Config from "../apiGoogleconfig.js"
import { isRenderingOn } from "../utils"

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

export default class SessionStore {
  @observable authUser = null
  @observable message = undefined
  @observable status = "unloaded"
  @observable user = undefined

  constructor(rootStore) {
    this.rootStore = rootStore
    this.gapi = undefined
    
    this.loadAPIClient()
  }

  @computed get isSignedIn() {
    return !!this.user
  }

  @computed get isReady() {
    return this.status === "ready"
  }

  @action doSignIn() {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().signIn()
    }
    else {
      console.log("Error: this.gapi not loaded")
    }
  }

  @action doSignOut() {
    if (this.gapi) {
      this.gapi.auth2.getAuthInstance().signOut()
    }
    else {
      console.log("Error: this.gapi not loaded")
    }
  }

  @action
  grantOfflineAccess() {
    var googleUser = this.gapi.auth2.getAuthInstance().currentUser.get()
    this.gapi.auth2
      .getAuthInstance()
      .grantOfflineAccess()
      .then(() => {
        googleUser
          .reloadAuthResponse()
          .then(resp => {
            this.user = googleUser
            console.log(resp, resp.code)
          })
          .catch(err => {
            console.log(err)
          });
      })
      .catch(err => {
        console.log(err)
      })
  }

  // Signed in/outの状態を更新
  updateSigninStatus(isSignedIn) {
    var googleUser = this.gapi.auth2.getAuthInstance().currentUser.get()

    if (isSignedIn) {
      var idToken = googleUser.getAuthResponse().id_token
      var creds = firebase.auth.GoogleAuthProvider.credential(idToken)
      firebase
        .auth()
        .signInAndRetrieveDataWithCredential(creds)
        .then(user => {
          var googleProfile = googleUser.getBasicProfile()
          this.user = googleUser
          this.status = "ready"
        })
        .catch(err => {
          this.user = undefined
          this.status = "ready"
        })
    }
    else {
      firebase.auth().signOut()
      this.user = undefined
      this.status = "ready"
    }
  }

  /**
   * Auth to the google Api.
   */
  initAPIClient(gapi) {
    this.gapi = gapi
    this.status = "loaded"
    this.gapi.client
      .init(Config)
      .then(() => {
        // Listen for sign-in state changes.
        this.gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen(this.updateSigninStatus)
        // Handle the initial sign-in state.
        this.updateSigninStatus(
          this.gapi.auth2.getAuthInstance().isSignedIn.get()
        )
      })
      .catch(err => {
        this.status =  "error:load"
        console.error("init api error", err);
      });
  }

  /**
   * Init Google Api
   * And create gapi in global
   */
  loadAPIClient() {
    if(isRenderingOn("server")) return
    var body = document.getElementsByTagName('body')[0]
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = "https://apis.google.com/js/api.js"
    script.async = true
    script.defer = true
    script.onload = () => {
      const gapi = window["gapi"]
      gapi.load("client:auth2", () => this.initAPIClient(gapi))
    }
    body.appendChild(script)
  }
}
