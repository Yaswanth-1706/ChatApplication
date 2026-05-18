import React from 'react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from "axios"
import "./emilverify.css"

const EmailVerify = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [verifyData, setVerifyData] = useState({
    email: location.state.email,
    otp: ""
  })

  const changeHandler = (e) => {
    setVerifyData({
      ...verifyData,
      [e.target.name]: e.target.value
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    try {
      await axios.post("https://chatapplication-backend-v90l.onrender.com/user/verifyOtp", verifyData)
      console.log("registration successful")
      navigate("/", {
        state: {
          name: location.state.name,
          email: location.state.email,
          password: location.state.password,
          profilepic: location.state.profilepic
        }
      })
    }
    catch (err) {
      console.log(err.message)
    }
  }

  const sendOtp = async () => {
    try {
      await axios.post("https://chatapplication-backend-v90l.onrender.com/user/updateOtp", location.state)
    }
    catch (err) {
      console.log(err.message)
    }
  }

  return (
    <div>
      <form className='EmailVerify' onSubmit={submitHandler}>
        <label>user email</label><br/>
        <input type="email" name="email" placeholder="enter your email" value={location.state.email} onChange={changeHandler}/><br/>
        <label>OTP</label><br/>
        <input type="Password" name="otp" placeholder="enter your OTP" onChange={changeHandler}/><br/>
        <input type="submit" value={"Register"} />
        <button type="button" onClick={sendOtp}>Resend OTP</button>
      </form>
    </div>
  )
}

export default EmailVerify