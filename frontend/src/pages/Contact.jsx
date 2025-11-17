import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { server } from '../main';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserLayout from '../layout/userLayout';

const Contact = () => {

    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");
    const [btnLoading, setBtnLoading] = useState(false);

    const navigate = useNavigate();

    const submitHandler = async (e) => {
        setBtnLoading(true);
        e.preventDefault();
        try {
            // const {data} = await axios.post(`${server}/api/v1/login`, {email, password});
            toast.success("Message Sent.");
        } catch (err) {
            toast.error(err.response.data.message);
        } finally {
            setBtnLoading(false);
            setEmail("");
            setMsg("");
        }
    }

  return (
  <UserLayout>
    <div className="form-container">
      <form onSubmit={submitHandler}>
        <h2>Contact Us</h2>
        <div>
          <input placeholder="Email" type="email" id="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
        </div>
        <div>
          <input style={{height: "10rem"}} type="text" placeholder="Type your message here..." id="msg" name="msg" value={msg} onChange={e=>setMsg(e.target.value)} required/>
        </div>
        <button disabled={btnLoading}>{btnLoading? "Loading..." : "Send"}</button>
        <p>Your feedback is our priority.</p>
      </form>
    </div>
  </UserLayout>
  )
}

export default Contact