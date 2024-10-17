import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import React, { useState } from 'react'

import NearPlaces from '../MapTrack/NearPlaces';
import Signup from '../authentication/Signup';
import Signin from '../authentication/Signin';
import Logout from '../authentication/Logout';
import Map from '../MapTrack/Map'
import PrivateRoute from '../authentication/PrivateRoute';
const BrowserRoute = () => {
  const [userEmail,setUserEmail] =useState('');
  return (
   <Router>
    <Routes>
    <Route path='/' element={<Signup/>} />
    <Route path='/signin' element={<Signin setUserEmail={setUserEmail}/>} />
        <Route path='/logout' element={<Logout email={userEmail}/>} />
        <Route path='/map-routing' element={<PrivateRoute><Map/></PrivateRoute>} />  
        <Route path='/NearBy' element={<PrivateRoute><NearPlaces/></PrivateRoute> } />
    </Routes>
   </Router>
  )
}

export default BrowserRoute
