import './App.css';
import React, {Fragment} from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ContractTester from './components/pages/ContractTester';
import EventLogger from './components/pages/EventLogger'

export const App = () => {
  return (
    <Router>
      <Fragment>
        <Navbar/>
        <Routes>
        <Route path='/' element={<ContractTester/>} />
          <Route path='/eventlogger' element={<EventLogger/>} />
          <Route path='/contracttester' element={<ContractTester/>} />
        </Routes>
      </Fragment>
    </Router>
    
  );
}

export default App;