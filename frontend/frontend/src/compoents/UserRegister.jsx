import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./userRegister.css"

const UserRegister = () => {
  const navigate = useNavigate()

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    profilepic: null
  })

  const [errorMessage, setErrorMessage] = useState("")

  const changeHandler = (e) => {
    if (errorMessage) setErrorMessage("")

    if (e.target.name === "profilepic") {
      setData({ ...data, profilepic: e.target.files[0] })
    } else {
      setData({ ...data, [e.target.name]: e.target.value })
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("gender", data.gender)

      if (data.profilepic) {
        formData.append("profilepic", data.profilepic)
      }

      const response = await axios.post(
        "https://chatapplication-backend-v90l.onrender.com/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      )

      // IMPORTANT: use backend response (not file object)
      const user = response.data.userRecord

      navigate("/", {
        state: {
          _id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          profilepic: user.profilepic // Cloudinary URL from backend
        }
      })

    } catch (err) {
      console.log("Error:", err.response?.data || err.message)

      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message)
      } else {
        setErrorMessage("Registration failed. Try again.")
      }
    }
  }

  return (
    <div>
      <form className="UserRegister" onSubmit={submitHandler}>
        {errorMessage && (
          <div className="register-error-msg">{errorMessage}</div>
        )}

        <label>User Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          onChange={changeHandler}
          required
        />

        <label>Email</label>
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

        <label>Gender</label>
        <select
          name="gender"
          value={data.gender}
          onChange={changeHandler}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label>Profile Picture</label>
        <input
          type="file"
          name="profilepic"
          accept="image/*"
          onChange={changeHandler}
        />

        <button className="register" type="submit">Register</button>

        <p>Already have an account?</p>
        <p onClick={() => navigate("/")}>Login here</p>
      </form>
    </div>
  )
}

export default UserRegister