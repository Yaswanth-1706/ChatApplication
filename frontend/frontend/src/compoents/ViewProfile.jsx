import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./viewprofile.css"

const ViewProfile = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Guard clause
  if (!location.state) {
    return (
      <div className="profile-container">
        <h1>No Profile Data Available</h1>
      </div>
    )
  }

  // Direct Cloudinary-ready data
  const { name, email, gender, profilepic } = location.state

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* BACK BUTTON */}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        {/* PROFILE IMAGE */}
        <img
          className="profile-image"
          src={`https://chatapplication-backend-v90l.onrender.com${profilepic}`}
          alt={name}
        />

        {/* NAME */}
        <h2 className="profile-name">{name}</h2>

        {/* EMAIL */}
        <p className="profile-email">{email}</p>

        {/* DETAILS */}
        <div className="profile-details">
          <div className="detail-item">
            <span>Gender:</span> {gender}
          </div>
        </div>

      </div>
    </div>
  )
}

export default ViewProfile