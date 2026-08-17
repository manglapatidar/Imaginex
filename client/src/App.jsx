// import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Sidebar from './components/Sidebar';

// // Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Explore from './pages/Explore';
import Generate from './pages/Generate';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import { ToastContainer } from 'react-toastify';
import PrivateComponent from './components/PrivateComponent';
import PrivateAdminComponent from './components/admin/PrivateAdminComponent';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminReports from './pages/admin/AdminReports';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';


const App = () => {
  return (
    <BrowserRouter>

      <div className="flex h-screen overflow-hidden">

        <Routes>

          <Route path='/' element={<Landing />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Auth Routes */}
          <Route path='/auth' element={<PrivateComponent />}>
            <Route path='feed' element={<Feed />} />
            <Route path='explore' element={<Explore />} />
            <Route path='generate' element={<Generate />} />
            <Route path='profile/:username' element={<Profile />} />
            <Route path='post/:pid' element={<PostDetail />} />

          </Route>



          {/* Admin Routes */}
          <Route path='/admin' element={<PrivateAdminComponent />}>
          <Route path='dashboard' element={<AdminDashboard />} />
           <Route path='reports' element={<AdminReports />} />
          <Route path='users' element={<AdminUsers />} />
          <Route path='posts' element={<AdminPosts />} />

          
          </Route>



        </Routes>
        <ToastContainer position="top-center" theme="dark" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
      </div>
    </BrowserRouter>
  )
}

export default App
