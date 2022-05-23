import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import googleIcon from '../assets/svg/googleIcon.svg';

function OAuth(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoogleAuthClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, 'users', user.uid);
      const retrievedDoc = await getDoc(docRef);

      if (!retrievedDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (error) {
      toast.error('Could not authorize user with Google');
    }
  };

  return (
    <div className="socialLogin">
      <p>
        Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with{' '}
        <button className="socialIconDiv" onClick={onGoogleAuthClick}>
          <img className="socialIconImg" src={googleIcon} alt="google"></img>
        </button>
      </p>
    </div>
  );
}

export default OAuth;
