import React from "react"
import { inject, observer, Provider } from "mobx-react"
import { observable, action, computed } from "mobx"
import stores from "../stores"

// ログインしているならchildrenが有効
export const SessionSignedIn = inject("sessionStore")(
  observer(({ sessionStore, children }) =>
    sessionStore.isReady && sessionStore.isSignedIn ? children : false
  )
)

// ログアウトしているならchildrenが有効
export const SessionSignedOut = inject("sessionStore")(
  observer(({ sessionStore, children }) =>
    sessionStore.isReady && !sessionStore.isSignedIn ? children : false
  )
)

// セッションが使えない状態だとchildrenが有効
export const SessionNotReady = inject("sessionStore")(
  observer(({ sessionStore, children }) =>
    !sessionStore.isReady ? children : false
  )
)
