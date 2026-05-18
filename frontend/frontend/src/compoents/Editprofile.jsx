import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './editProfile.css';

const Editprofile = () => {
    const location = useLocation();
    const navigate = useNavigate();

    if (!location.state) {
        return (
            <div className='profile-container'>
                <h1>No Profile Data</h1>
            </div>
        );
    }

    const { img, name, email, gender } = location.state;

    return (
        <div className='profile-container'>
            <div className='profile-card'>

                <button
                    className='back-btn'
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <img
                    className='profile-image'
                    src={img}
                    alt={name}
                />

                <h2 className='profile-name'>{name}</h2>

                <p className='profile-email'>{email}</p>

                <div className='profile-details'>
                    <div className='detail-item'>
                        <span>Gender :</span> {gender}
                        <button onClick={() =>
                          navigate("/updateProfile") } >Edit Profile</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Editprofile;