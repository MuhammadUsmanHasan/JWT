import React, {useState, useContext, useEffect} from 'react';
import { navigate } from "@reach/router"
import { UserContext } from '../App';

const Login = ()=> {
    const [user,setUser] = useContext(UserContext);
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('');
// 'applicaiton/x-www-form-urlencoded'
    var jsonObject = {
        method: 'POST',
        credentials: 'include',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({
            email: email,
            password: password
            })
    }

    const handlesubmit =async e =>{
        // we wait two times 1 for fetch to complete 
        // second to convert everything to json
        e.preventDefault();
        const result = await (await fetch ('http://localhost:4000/login',jsonObject)).json(); 
        if(result.accesstoken){
            setUser({ accesstoken: result.accesstoken});
            navigate('/');
        } else{
            console.log(result.error);
            
        }
    }

    useEffect(()=>{
        console.log(user);
    },[user])

    const handlechange = e=>{
        if(e.currentTarget.name ==='email'){
            setEmail(e.currentTarget.value);
        }
        
        else if(e.currentTarget.name ==='password'){
            setPassword(e.currentTarget.value);
        }
    }

    return (
        <div className='login-wrapper'>
            <form onSubmit={handlesubmit}>
                <h2>Login</h2>
                <div className='login-input'>
                    <input 
                        value = {email}
                        onChange = {handlechange}
                        type = 'text'
                        name='email'
                        placeholder='email'
                        autoComplete='email'
                    />
                
                    <input 
                        value = {password}
                        onChange = {handlechange}
                        type = 'password'
                        name='password'
                        placeholder='Password'
                        autoComplete='current-password'
                        />
                    <button type='sumbit'>Login</button>
                </div>
            </form>



        </div>
    )

}

export default Login;