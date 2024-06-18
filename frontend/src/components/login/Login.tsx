import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { User } from '../../model/domain/User';
import { Submission } from '../../model/domain/Submission';
import { AuthenticatePresenter } from '../../presenter/AuthenticatePresenter';

interface Props {
  setLoggedInUser: (user: User | null) => void;
  setSubmissions: (submissions: Submission[]) => void;
}
export function Login(props: Props) {
  useEffect(() => {
    const presenter = new AuthenticatePresenter({
      setLoggedInUser: props.setLoggedInUser,
      setSubmissions: props.setSubmissions,
    });

    const checkUser = async () => {
      const token = Cookies.get('token');
      if (token) {
        await presenter.getUserInfo();
        window.location.href = '/grader';
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('submissions');
        props.setLoggedInUser(null);
        props.setSubmissions([]);
        window.location.href = '/';
      }
    };

    checkUser();
  }, []);

  return <></>;
}
