import React, { useRef } from 'react'
import firebaseApp from '../firebase-config'


//create a link that starts the game AFTER signup
//create a link that links directly to game without signup
//find a way to pass the user information to the game (so that we can access: USER OBJ)


const SignInComponent = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null)

  const signUp = (event) => {
    event.preventDefault();
    firebaseApp.auth().createUserWithEmailAndPassword(
      emailRef.current.value,
      passwordRef.current.value
    ).then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
    })
  }

  const signIn = (event) => {
    event.preventDefault();
    firebaseApp.auth().signInWithEmailAndPassword(
      emailRef.current.value,
      passwordRef.current.value
    ).then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div className="signin">
      <form action="">
        <h1> Sign In</h1>
        <input ref={emailRef} type="email" />
        <input ref={passwordRef} type="password" />
        <button onClick={signIn}> Sign in</button>
        <h6>Not yet registered?
          <button onClick={signUp} >
            Sign up
          </button>
          <button onClick={signUp} >
            Just Make Meowsic!
          </button>
        </h6>
      </form>
    </div>
  )
}
export default SignInComponent
