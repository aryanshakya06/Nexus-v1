import React from 'react'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import { ToastContainer } from 'react-toastify';
import VerifyOTP from './pages/VerifyOTP.jsx';
import Loading from './pages/Loading.jsx';
import { AppData } from './context/AppContext.jsx';
import Register from './pages/Register.jsx';
import Verify from './pages/Verify.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import VerifiedHome from './pages/VerifiedHome.jsx';
import Contact from './pages/Contact.jsx';
import Project from './pages/Project.jsx';
import Profile from './pages/Profile.jsx';
import CreateProject from './pages/CreateProject.jsx';
import ProjectId from './pages/ProjectId.jsx';
import Analytics from './pages/Analytics.jsx';

const App = () => {

  const { isAuth, loading} = AppData();

  return (
    <>
    {loading ? <Loading/> : <BrowserRouter>
    <Routes>
      <Route path='/' element={isAuth ? <VerifiedHome/> :<Home/>}/>
      <Route path='/contact-us' element={<Contact/>}/>
      <Route path='/profile' element={isAuth ? <Profile/> :<Home/>}/>
      <Route path='/home' element={ isAuth ? <VerifiedHome/> : <Login />} />
      <Route path='/login' element={ isAuth ? <VerifiedHome/> : <Login />} />
      <Route path='/register' element={ isAuth ? <VerifiedHome/> : <Register />} />
      <Route path='/verify-otp' element={ isAuth ? <VerifiedHome/> : <VerifyOTP/>} />
      <Route path='/token/:token' element={ isAuth ? <VerifiedHome/> : <Verify/>} />
      <Route path='/dashboard' element={ isAuth ? <AdminDashboard/> : <Login/>} />
      <Route path='/project' element={ isAuth ? <Project/> : <Login/>} />
      <Route path='/create-project' element={ isAuth ? <CreateProject/> : <Login />} />
      <Route path='/project/:id' element={ isAuth ? <ProjectId/> : <Login />} />
      <Route path="/analytics" element={isAuth ? <Analytics /> : <Login />} />
      </Routes>
    <ToastContainer/>
    </BrowserRouter>}
    </>
  )
}
export default App
