import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grader } from './components/grader/Grader';
import { NavBar } from './components/navbar/NavBar';
import { useEffect, useState } from 'react';
import { UserInfo } from './components/userInfo/UserInfo';
import { Submissions } from './components/submissions/Submissions';
import { User } from './model/domain/User';
import { Submission } from './model/domain/Submission';
import { Login } from './components/login/Login';
import Cookies from 'js-cookie';

function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(localStorage.getItem('user') ? User.fromJson(JSON.parse(localStorage.getItem('user')!)) : null);
  const [submissions, setSubmissions] = useState<Submission[]>(
    localStorage.getItem('submissions') ? JSON.parse(localStorage.getItem('submissions')!).map((item: JSON) => Submission.fromJson(item)) : []
  );
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(localStorage.getItem('impersonatedUser') ? User.fromJson(JSON.parse(localStorage.getItem('impersonatedUser')!)) : null);

  useEffect(() => {
    if (!Cookies.get('token') && loggedInUser) {
      localStorage.removeItem('user');
      localStorage.removeItem('submissions');
      setLoggedInUser(null);
      setSubmissions([]);
      window.location.href = '/';
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <NavBar impersonatedUser={impersonatedUser} setImpersonatedUser={setImpersonatedUser} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} setSubmissions={setSubmissions} />
        <Routes>
          <Route path="/login" element={<Login setLoggedInUser={setLoggedInUser} setSubmissions={setSubmissions} />} />
        </Routes>
        {loggedInUser ? (
          <Routes>
            <Route path="/grader" element={<Grader user={impersonatedUser ?? loggedInUser} setSubmissions={setSubmissions} />} />
            <Route path="/profile" element={<UserInfo impersonated={!!impersonatedUser} user={impersonatedUser ?? loggedInUser} setUser={setLoggedInUser} />} />
            <Route path="/submissions" element={<Submissions submissions={submissions} />} />
            <Route path="*" element={<Grader user={impersonatedUser ?? loggedInUser} setSubmissions={setSubmissions} />} />
          </Routes>
        ) : (
          <h1>Please log in to access the autograder.</h1>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
