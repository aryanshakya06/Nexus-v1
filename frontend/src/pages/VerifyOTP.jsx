import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import {server} from '../main.jsx'  
import { toast } from 'react-toastify'
import { AppData } from '../context/AppContext.jsx'
import UserLayout from '../layout/userLayout/index.jsx'

const VerifyOTP = () => {

  const [otp, setOtp] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const email = localStorage.getItem("email");
  const navigate = useNavigate();
  const {setIsAuth, setUser} = AppData();

  const submitHandler = async (e) => {
    setBtnLoading(true);
    e.preventDefault();
    try {
      const {data} = await axios.post(`${server}/api/v1/verify`, {email, otp}, {
        withCredentials: true,
      });

      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      localStorage.clear("email");
      localStorage.setItem("name", data.user.name);
      navigate("/home");
    } catch (err) {
      toast.error(err.response.data.message);
    } finally {
      setBtnLoading(false)
    }
  }

  return (
  <UserLayout>
    <div className="form-container">
        <form onSubmit={submitHandler}>
          <h2>Verify Using OTP</h2>
          <div>
            <label htmlFor="otp">OTP</label>
            <input  type="number" id="otp" name="otp" value={otp} onChange={e=>setOtp(e.target.value)} required/>
          </div>
          <button disabled={btnLoading}>
              {btnLoading? "Loading..." : "Verify"}</button>
        </form>
      </div>
  </UserLayout>  
  )
}

export default VerifyOTP;