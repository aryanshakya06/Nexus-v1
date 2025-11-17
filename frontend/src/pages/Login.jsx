import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { server } from '../main';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../layout/userLayout';

const Login = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [btnLoading, setBtnLoading] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        setBtnLoading(true);
        e.preventDefault();
        try {
            const {data} = await axios.post(`${server}/api/v1/login`, {email, password});
            toast.success(data.message);
            if(data.success) {
                localStorage.setItem("email", email);
                navigate("/verify-otp")
            }
        } catch (err) {
            toast.error(err.response.data.message);
        } finally {
            setBtnLoading(false);
        }
    }

  return (
  <UserLayout>
    <div className="form-container">
      <form onSubmit={submitHandler}>
        <h2>Login</h2>
        <div>
          <input placeholder="Email" type="email" id="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div>
        <div>
          <input placeholder="Password" type="password" id="password" name="password" value={password} onChange={e=>setPassword(e.target.value)} required/>
        </div>
        <button disabled={btnLoading}>{btnLoading? "Loading..." : "Login"}</button>
        <p>Don't have an account?&nbsp;<Link to="/register">Sign up</Link></p>
      </form>
    </div>
  </UserLayout>
  )
}

export default Login