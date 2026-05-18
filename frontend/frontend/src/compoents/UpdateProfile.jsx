import React, { useEffect } from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useLocation, useNavigate } from 'react-router-dom'
import './updateProfile.css'

const UpdateProfile = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [data, setData] = useState({
        name: "",
        password: "",
        profilepic: ""
    });

    const changeHandler = (e) => {
        if (e.target.name === "profilepic") {
            setData({
                ...data,
                profilepic: e.target.files[0]
            })
        }
        else {
            setData({
                ...data,
                [e.target.name]: e.target.value
            })
        }
    } 

    const submitHandler = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("password", data.password);

        // CRITICAL: This key "profilepic" must match the backend
        if (data.profilepic) {
            formData.append("profilepic", data.profilepic);
        }

        try {
            const token = localStorage.getItem("token")
            const response = await axios.put("https://chatapplication-backend-v90l.onrender.com/user/updateprofile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            navigate(-1);
        } catch (err) {
            console.log("Error details:", err.response?.data || err.message);
        }
    };

    return (
        <div>
            <form className='UserRegister' onSubmit={submitHandler}>
                <h3>update</h3>
                <label>user name</label>
                <input type="text" name="name" placeholder="enter your name" onChange={changeHandler}/><br/>
                <label>Password</label><br/>
                <input type="Password" name="password" placeholder="enter your Password" onChange={changeHandler}/><br/>
                <label>Profile Pic</label><br />
                <input type="file" name="profilepic" accept="image/*" onChange={changeHandler}/><br />
                <input type="submit" value={"update"} /><br/>
            </form>
        </div>
    )
}

export default UpdateProfile