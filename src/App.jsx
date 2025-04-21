import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Account from './pages/Account';
import ParentManagement from './pages/ParentManagement';
import ManageChildren from './pages/ManageChildren';
import ManageChores from './pages/ManageChores';
import ManageChoreAssignments from './pages/ManageChoreAssignments';
import ManagePrizes from './pages/ManagePrizes';
import AddChild from './pages/AddChild';
import EditChild from './pages/EditChild'; 
import AddChore from './pages/AddChore';
import EditChore from './pages/EditChore';
import AddChoreAssignment from './pages/AddChoreAssignment';
import EditChoreAssignment from './pages/EditChoreAssignment';
import AddPrize from './pages/AddPrize';
import EditPrize from './pages/EditPrize';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/account" element={<Account />} />
        <Route path="/parent-management" element={<ParentManagement />} />
        <Route path="/manage-children" element={<ManageChildren />} />
        <Route path="/manage-chores" element={<ManageChores />} />
        <Route path="/manage-chore-assignments" element={<ManageChoreAssignments />} />
        <Route path="/manage-prizes" element={<ManagePrizes />} />
        <Route path="/add-child" element={<AddChild />} /> 
        <Route path="/edit-child/:childId" element={<EditChild />} />
        <Route path="/add-chore" element={<AddChore />} />
        <Route path="/edit-chore/:choreId" element={<EditChore />} />
        <Route path="/add-chore-assignment" element={<AddChoreAssignment />} />
        <Route path="/edit-chore-assignment/:assignmentId" element={<EditChoreAssignment />} />
        <Route path="/add-prize" element={<AddPrize />} />
        <Route path="/edit-prize/:prizeId" element={<EditPrize />} />
      </Routes>
    </Router>
  );
}

export default App;