import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './editprofile.css'

const BASE_URL = "https://chatapplication-backend-v90l.onrender.com"

const Editprofile = () => {

    const location = useLocation()
    const navigate = useNavigate()

    if (!location.state) {
        return (
            <div className='profile-container'>
                <h1>No Profile Data</h1>
            </div>
        )
    }

    const { profilepic, name, email, gender } = location.state

    // ✅ FIX PROFILE PIC URL
    const getProfilePic = (pic) => {
        if (!pic) return null

        // cloudinary image
        if (pic.startsWith("http")) {
            return pic
        }

        // local uploads image
        return `${BASE_URL}${pic}`
    }

    // ✅ FALLBACK AVATAR
    const getAvatarFallback = (name) => {
        const initials = (name || "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)

        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
            <rect width="100%" height="100%" fill="#128C7E"/>
            <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
            font-size="42" fill="white" font-family="Arial">
            ${initials}
            </text>
        </svg>
        `

        return `data:image/svg+xml;base64,${btoa(svg)}`
    }

    return (
        <div className='profile-container'>

            <div className='profile-card'>

                {/* BACK BUTTON */}
                <button
                    className='back-btn'
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                {/* PROFILE IMAGE */}
                <img
                    className='profile-image'
                    src={
                        getProfilePic(profilepic) ||
                        getAvatarFallback(name)
                    }
                    alt={name}
                    onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAvatarFallback(name)
                    }}
                />

                {/* NAME */}
                <h2 className='profile-name'>
                    {name}
                </h2>

                {/* EMAIL */}
                <p className='profile-email'>
                    {email}
                </p>

                {/* DETAILS */}
                <div className='profile-details'>

                    <div className='detail-item'>
                        <span>Gender :</span> {gender}
                    </div>

                </div>

                {/* EDIT BUTTON */}
                <button
                    className='detail-item-button'
                    onClick={() =>
                        navigate("/updateProfile", {
                            state: location.state
                        })
                    }
                >
                    Edit Profile
                </button>

            </div>

        </div>
    )
}

export default Editprofile