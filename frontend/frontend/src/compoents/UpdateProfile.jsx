import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./updateProfile.css"

const UpdateProfile = () => {
  const navigate = useNavigate()

  const [data, setData] = useState({
    name: "",
    password: "",
    profilepic: null
  })

  const [loading, setLoading] = useState(false)

  const changeHandler = (e) => {
    if (e.target.name === "profilepic") {
      setData({
        ...data,
        profilepic: e.target.files[0]
      })
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value
      })
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()

      // Only send fields if provided (prevents overwriting with empty values)
      if (data.name.trim()) {
        formData.append("name", data.name)
      }

      if (data.password.trim()) {
        formData.append("password", data.password)
      }

      if (data.profilepic) {
        formData.append("profilepic", data.profilepic)
      }

      const token = localStorage.getItem("token")

      const response = await axios.put(
        "https://chatapplication-backend-v90l.onrender.com/user/updateprofile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      console.log("Profile updated:", response.data)

      setLoading(false)
      navigate(-1)

    } catch (err) {
      setLoading(false)
      console.log("Update error:", err.response?.data || err.message)
    }
  }

  return (
    <div className="update-container">
      <form className="UserRegister" onSubmit={submitHandler}>

        <h3>Update Profile</h3>

        <label>User Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter new name"
          onChange={changeHandler}
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter new password"
          onChange={changeHandler}
        />

        <label> choose Profile Picture
        <input
          type="file"
          name="profilepic"
          accept="image/*"
          onChange={changeHandler}
        />
        </label>

        <button className="submit" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update"} 
        </button>

      </form>
    </div>
  )
}

export default UpdateProfile