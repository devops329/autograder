import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grader } from './components/grader/Grader';
import { NavBar } from './components/navbar/NavBar';
import { useState } from 'react';
import { UserInfo } from './components/userInfo/UserInfo';
import { Submissions } from './components/submissions/Submissions';
import { Admin } from './components/admin/Admin';
import { User } from './model/domain/User';
import { Submission } from './model/domain/Submission';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(localStorage.getItem('user') ? User.fromJson(JSON.parse(localStorage.getItem('user')!)) : null);
  const [submissions, setSubmissions] = useState<Submission[]>(
    localStorage.getItem('submissions') ? JSON.parse(localStorage.getItem('submissions')!).map((item: JSON) => Submission.fromJson(item)) : []
  );

  return (
    <>
      <BrowserRouter>
        <NavBar loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setSubmissions={setSubmissions} />
        {loggedInUser ? (
          <Routes>
            <Route path="/grader" element={<Grader setSubmissions={setSubmissions} />} />
            <Route path="/profile" element={<UserInfo user={loggedInUser} setUser={setLoggedInUser} />} />
            <Route path="/submissions" element={<Submissions submissions={submissions} />} />
            {loggedInUser.isAdmin && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<Grader setSubmissions={setSubmissions} />} />
          </Routes>
        ) : (
          <h1>Please log in to access the autograder.</h1>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
