import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./userlogin.css"

const UserLogin = () => {
  const navigate = useNavigate()

  const [data, setData] = useState({
    email: "",
    password: ""
  })

  const changeHandler = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    })
  }

  const submitHandler = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(
        "https://chatapplication-backend-v90l.onrender.com/user/login",
        data
      )

      const user = response.data.User
      const token = response.data.token

      // STORE AUTH DATA
      localStorage.setItem("token", token)
      localStorage.setItem("userId", user._id)

      // NAVIGATE WITHOUT SENSITIVE DATA
      navigate("/Home", {
        state: {
          _id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          profilepic: user.profilepic // Cloudinary URL
        }
      })

    } catch (err) {
      console.log(err.response?.data || err.message)
    }
  }

  return (
    <div className="login-page-wrapper">
      <form className="UserLogin" onSubmit={submitHandler}>

        <h2>Login</h2>

        <label>User Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={changeHandler}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          onChange={changeHandler}
          required
        />

        <input type="submit" value="Login" />

        <div className="form-footer">
          <p>If you do not have an account</p>
          <p
            className="register-link"
            onClick={() => navigate("/register")}
          >
            Register here
          </p>
        </div>

      </form>
    </div>
  )
}

export default UserLogin