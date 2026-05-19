import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './userRegister.css'

const UserRegister = () => {
    const navigate = useNavigate()
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        gender: "",
        profilepic: ""
    });

    const [errorMessage, setErrorMessage] = useState("");

    const changeHandler = (e) => {
        if (errorMessage) {
            setErrorMessage("");
        }

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
        setErrorMessage("");
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("gender", data.gender);

        if (data.profilepic) {
            formData.append("profilepic", data.profilepic);
        }

        try {
            const response = await axios.post("https://chatapplication-backend-v90l.onrender.com/user/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // navigate("/verfiyEmail", {
            //     state: {
            //         name: data.name,
            //         email: data.email,
            //         password: data.password,
            //         profilepic: data.profilepic
            //     }
            // })
            navigate("/", {
                state: {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    profilepic: data.profilepic
                }
            })

        } catch (err) {
            console.log("Error details:", err.response?.data || err.message);
            
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.message || "This email is already registered.");
            } else {
                setErrorMessage("An error occurred during registration. Please try again.");
            }
        }
    };

    return (
        <div>
            <form className='UserRegister' onSubmit={submitHandler}>
                {errorMessage && <div className="register-error-msg">{errorMessage}</div>}

                <label>user name</label>
                <input type="text" name="name" placeholder="enter your name" onChange={changeHandler}/><br/>
                <label>user email</label><br/>
                <input type="email" name="email" placeholder="enter your email" onChange={changeHandler}/><br/>
                <label>Password</label><br/>
                <input type="Password" name="password" placeholder="enter your Password" onChange={changeHandler}/><br/>
                <label>Gender</label><br />
                <select name="gender" value={data.gender} onChange={changeHandler} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select><br />
                <label>Profile Pic</label><br />
                <input type="file" name="profilepic" accept="image/*" onChange={changeHandler}/><br />
                <input type="submit" value={"Register"} /><br/>
                <p>if you already have an account</p><br/>
                <p onClick={() => { navigate("/") }}>login here</p>
            </form>
            {
                console.log(data)
            }
        </div>
    )
}

export default UserRegister