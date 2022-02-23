

import React, {useState, useEffect} from 'react';
import {Router, navigate} from '@reach/router';

import Content from './components/Content';
import Login from './components/Login';
import Nagivation from './components/Navigation';
import Protected from './components/Protected';
import Register from './components/Register';

export const UserContext = React.createContext([]);

function App() {
  const [user,setUser] = useState({});
  const [loading, setLoading]= useState(true);

  const logOutCallback = async () =>{
    await fetch('http://localhost:4000/logout',{
      method: 'POST',
      credentials: 'include'
    })
    // clear user from context
    setUser({})
    // Navigate back to start page
    navigate('/');
  }
  // first thing, get a new accesstoken if a refreshtoken exists
  useEffect(()=>{
    async function checkRefreashToken(){
      const result = await (await fetch('http://localhost:4000/refresh_token', {
        method: 'POST',
        credentials: 'include', // needed to include the cookie
        headers:{
          'Content-Type': 'application/json',
        }
       
      })).json();
      setUser({
        accesstoken: result.accesstoken,
      });
      setLoading(false);
    }
    checkRefreashToken();
  },[])
  if (loading) return <div>Loading...</div>
  return (
    <UserContext.Provider value = {[user,setUser]}>
        <div className="app">
          <Nagivation logOutCallback ={logOutCallback}/>
          <Router id="router">
            <Login path = "login"/>
            <Register path = "register"/>
            <Protected path = "protected"/>
            <Content path = "/"/>
          </Router>
      </div>
    </UserContext.Provider>

  
  );
}

export default App;
