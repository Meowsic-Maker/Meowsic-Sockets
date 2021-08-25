import Home from './firebase/components/Home';
import SignInComponent from './firebase/components/SignInComponent';
import SignUpComponent from './firebase/components/SignUpComponent';
import React from 'react';

function App() {
  return (
    <div className="App">
      <Home />
      <SignInComponent />
      <SignUpComponent />
    </div>
  );
}

export default App;
