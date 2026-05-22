import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./viewprofile.css"

const BACKEND_URL = "https://chatapplication-backend-v90l.onrender.com"
const CLOUDINARY_URL = "https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload"

const getProfilePic = (pic) => {
  if (!pic) return null
  if (pic.startsWith("http")) return pic                              // already full URL
  if (pic.startsWith("/public") || pic.startsWith("/uploads")) {
    return `${BACKEND_URL}${pic}`                                     // backend static file
  }
  return `${CLOUDINARY_URL}/${pic}`                                   // cloudinary public ID
}

const ViewProfile = () => {
  const location = useLocation()
  const navigate = useNavigate()

  if (!location.state) {
    return (
      <div className="profile-container">
        <h1>No Profile Data Available</h1>
      </div>
    )
  }

  const { name, email, gender, profilepic } = location.state

  const getAvatarFallback = (name) => {
    const initials = (name || "?")
      .split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="64" fill="#128C7E"/>
      <text x="64" y="72" text-anchor="middle" font-size="48" font-family="Arial" fill="#fff">${initials}</text>
    </svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  return (
    <div className="profile-container">
      <div className="profile-card">

        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* PROFILE IMAGE */}
        <img
          className="profile-image"
          src={getProfilePic(profilepic) || getAvatarFallback(name)}
          alt={name}
          onError={(e) => {
            e.target.onerror = null
            e.target.src = getAvatarFallback(name)
          }}
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