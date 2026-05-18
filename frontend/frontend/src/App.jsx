import react from "react"
import UserRegister from "./compoents/UserRegister"
import EmailVerify from "./compoents/EmailVerify"
import { Route, Routes } from "react-router-dom"
import UserLogin from "./compoents/UserLogin"
import Home from "./compoents/Home"
import ViewProfile from "./compoents/ViewProfile"
import Editprofile from "./compoents/Editprofile"
import UpdateProfile from "./compoents/UpdateProfile"
function App() {
  return (
    
    <div>
      <Routes>
    <Route path="/register" element={<UserRegister/>}/>
    <Route path="/verfiyEmail" element={<EmailVerify/>}/>
    <Route path="/" element={<UserLogin/>}/>
    <Route path="/Home" element={<Home/>}/>
    <Route path="/viewProfile" element={<ViewProfile/>}/>
    <Route path="/editProfile" element={<Editprofile/>}/>
    <Route path="/updateProfile" element={<UpdateProfile/>}/>
  </Routes>
    </div>
  )
}
export default App
