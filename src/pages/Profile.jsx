import { useEffect, useState } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
  const auth = getAuth();
  const [editDetails, setEditDetails] = useState(false);
  const [updateUser, setUpdateUser] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  const onLogOut = () => {
    auth.signOut();
    navigate('/');
  };

  // const editUser = () => {
  //   debugger;
  //   setUpdateUser(!updateUser);
  //   if (updateUser) {
  //     onSubmit();
  //   }
  // };

  const editUser = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = () => {
    console.log(123);
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogOut}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              editDetails && onSubmit();
              setEditDetails(!editDetails);
            }}>
            {editDetails ? 'save' : 'edit'}
          </p>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!editDetails ? 'profileName' : 'profileNameActive'}
              disabled={!editDetails}
              value={name}
              onChange={editUser}
            />
          </form>
        </div>
        <div className="profileCard">
          <form>
            <input
              type="text"
              id="email"
              className={!editDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!editDetails}
              value={email}
              onChange={editUser}
            />
          </form>
        </div>
      </main>
    </div>
  );
}

export default Profile;
