import React, { useRef } from 'react'
import firebaseConfig from 'firebase-config'
import firebase from 'firebase/app'
import 'firebase/auth'

//init Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig)

const SignUpComponent = () => {
  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);


  const SignUpFunc = (event) => {
    event.preventDefault();
    firebaseApp.auth().createUserWithEmailNameAndPassword(
      emailRef.current.value,
      usernameRef.current.value,
      passwordRef.current.value
    ).then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
    })
  }

  return(
    <div className="signup">
    <form action="">
      <h1> Sign Up</h1>
      <input ref={emailRef} type="email"/>
      <input ref={usernameRef} type="username"/>
      <input ref={passwordRef} type="password"/>
      <button onClick={signIn}> Sign in with new account! </button>
      <button onClick={signUp}>
        Just Make Meowsic!
      </button>
    </form>
  </div>
  )
}

export default SignUpComponent
