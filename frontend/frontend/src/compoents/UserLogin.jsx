import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./userlogin.css"

const UserLogin = () => {
  const navigate = useNavigate()
  const [data, setData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value })
    setError("")
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post(
        "https://chatapplication-backend-v90l.onrender.com/user/login",
        data
      )

      const user = response.data.User
      const token = response.data.token

      localStorage.setItem("token", token)
      localStorage.setItem("userId", user._id)

      navigate("/Home", {
        state: {
          _id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          profilepic: user.profilepic
        }
      })

    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || ""

      if (status === 404 || message.toLowerCase().includes("not found") ||
          message.toLowerCase().includes("not registered")) {
        setError("User not registered. Please create an account.")
      } else if (status === 401 || message.toLowerCase().includes("password") ||
                 message.toLowerCase().includes("invalid")) {
        setError("Invalid password. Please try again.")
      } else {
        setError("Login failed. Please try again.")
      }

      console.log(err.response?.data || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <form className="UserLogin" onSubmit={submitHandler}>

        <h2>Login</h2>

        {error && (
          <div className="error-msg">
            {error}
          </div>
        )}

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

        <input
          type="submit"
          value={loading ? "Logging in..." : "Login"}
          disabled={loading}
        />

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