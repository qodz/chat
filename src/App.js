import logo from './logo.svg';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import React, { useEffect, useState } from "react";

firebase.initializeApp({
  apiKey: "AIzaSyCprRuPBOWkxsZWqrnrkHEEmyJYNXxYi8I",

  authDomain: "authentication-e36bd.firebaseapp.com",

  projectId: "authentication-e36bd",

  storageBucket: "authentication-e36bd.appspot.com",

  messagingSenderId: "950569808550",

  appId: "1:950569808550:web:5ab3f0fde02bcb2b7afa67"


});


const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>ChatApp with React and Firebase</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )

}

function SignOut() {
  return auth.currentUser && ( <button onClick={() => auth.signOut()}>Sign out</button> )
}


function ChatRoom() {
  const messageRefs = firestore.collection('messages');
  const query = messageRefs.orderBy('createdAt').limit(15);
  const dummy = React.useRef();

  const [messages] = useCollectionData(query, { idField: 'id' });
  // this listens to any changes to the messages collection and returns an array of objects

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {

    e.preventDefault();
    console.log(auth.currentUser);
    console.log(auth.currentUser.uid);
    const [uid, photoURL] = [auth.currentUser.uid, auth.currentUser.photoURL];
    await messageRefs.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,   // this is the user's id
      photoURL,
    });
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg}/>)}
      <div ref={dummy}></div>
    </main>

    <form onSubmit={sendMessage}>
      <input type="text" value={formValue} onChange={(e)=> setFormValue(e.target.value)} />
      <button type="submit">🕊</button>
    </form>
    </>
  )
}


function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>

      <img src={photoURL} alt="avatar" />
      <p>{text}</p>
    </div>
  )
}

export default App;
