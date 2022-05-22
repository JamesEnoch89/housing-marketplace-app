import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';

function ForgotPassword() {
  const [email, setEmail] = useState('');

  const onChange = (event) => {
    setEmail(event.target.value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success('Email sent successfully!');
    } catch (error) {
      toast.error('Error sending email');
    }
  };

  return (
    <div>
      <h1>ForgotPassword</h1>

      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="emailInput"
            name="email"
            id="email"
            value={email}
            placeholder="Email"
            onChange={onChange}
          />

          <Link className="forgotPasswordLink" to="/sign-in">
            Sign In
          </Link>

          <div className="signInBar">
            <p className="signInText">Send Password Reset Email</p>

            <button className="signInButton">
              <ArrowRightIcon
                fill="#ffffff"
                width="34px"
                height="34px"></ArrowRightIcon>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ForgotPassword;
