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
  const [impersonating, setImpersonating] = useState<boolean>(!!localStorage.getItem('impersonatedUser'));
  const [user, setUser] = useState<User | null>(
    impersonating ? User.fromJson(JSON.parse(localStorage.getItem('impersonatedUser')!)) : localStorage.getItem('user') ? User.fromJson(JSON.parse(localStorage.getItem('user')!)) : null
  );
  const [submissions, setSubmissions] = useState<Submission[]>(
    impersonating
      ? JSON.parse(localStorage.getItem('impersonatedSubmissions')!).map((item: JSON) => Submission.fromJson(item))
      : localStorage.getItem('submissions')
      ? JSON.parse(localStorage.getItem('submissions')!).map((item: JSON) => Submission.fromJson(item))
      : []
  );

  useEffect(() => {
    if (!Cookies.get('token') && user) {
      localStorage.removeItem('user');
      localStorage.removeItem('submissions');
      setUser(null);
      setSubmissions([]);
      window.location.href = '/';
    }
  }, []);

  return (
    <>
      <BrowserRouter>
        <NavBar impersonating={impersonating} setImpersonating={setImpersonating} user={user} setUser={setUser} setSubmissions={setSubmissions} />
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} setSubmissions={setSubmissions} />} />
        </Routes>
        {user ? (
          <Routes>
            <Route path="/grader" element={<Grader user={user} setSubmissions={setSubmissions} />} />
            <Route path="/profile" element={<UserInfo impersonating={impersonating} user={user} setUser={setUser} />} />
            <Route path="/submissions" element={<Submissions submissions={submissions} />} />
            <Route path="*" element={<Grader user={user} setSubmissions={setSubmissions} />} />
          </Routes>
        ) : (
          <h1>Please log in to access the autograder.</h1>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
