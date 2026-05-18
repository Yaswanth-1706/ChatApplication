import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios"
import './userlogin.css'
const UserLogin = () => {
  const location=useLocation()
  const navigate=useNavigate()
  const [data,setData]=useState({
          email:"",
          password:"",
      });
   const changeHandler=(e)=>{
    setData({
        ...data,
        [e.target.name]:e.target.value
    })
  }
  const submitHandler=async(e)=>{
   e.preventDefault()
   try{
   const responce= await axios.post("http://localhost:8000/user/login",data)
   console.log(responce.data.User.name,responce.data.User._id)
   localStorage.setItem("token", responce.data.token)
   localStorage.setItem("userId",responce.data.User._id)
    navigate("/Home",{
      state:{
        name:responce.data.User.name,

        email:responce.data.User.email,

        password:responce.data.User.password,
       
        gender:responce.data.User.gender,

        profilepic:responce.data.User.profilepic
      } 
    })
   }
   catch(err){
    console.log(err.message)
   }
}
  return (
  <div className="login-page-wrapper"> {/* New Wrapper */}
    <form className='UserLogin' onSubmit={submitHandler}>
      <h2>Login</h2>
      <label>User Email</label><br/>
      <input type="email" name="email" placeholder="Enter your email" onChange={changeHandler}/><br/>
      <label>Password</label><br/>
      <input type="Password" name="password" placeholder="Enter your password" onChange={changeHandler}/><br/>
      <input type="submit" value={"Login"} /><br/>
      <div className="form-footer">
        <p>If you do not have an account</p>
        <p className="register-link" onClick={()=>{navigate("/register")}}>Register here</p>
      </div>
    </form>
  </div>
)
}

export default UserLogin
