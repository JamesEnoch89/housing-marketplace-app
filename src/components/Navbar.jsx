import { useNavigate, useLocation } from 'react-router-dom';
import { ReactComponent as OfferIcon } from '../assets/svg/localOfferIcon.svg';
import { ReactComponent as ExploreIcon } from '../assets/svg/exploreIcon.svg';
import { ReactComponent as PersonOutlineIcon } from '../assets/svg/personOutlineIcon.svg';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNavItemActive = (route) => {
    debugger;
    return route === location.pathname;
  };

  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate('/')}>
            <ExploreIcon
              fill={isNavItemActive('/') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"></ExploreIcon>
            <p
              className={
                isNavItemActive('/')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }>
              Explore
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate('/offers')}>
            <OfferIcon
              fill={isNavItemActive('/offers') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"></OfferIcon>
            <p
              className={
                isNavItemActive('/offers')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }>
              Offer
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate('/profile')}>
            <PersonOutlineIcon
              fill={isNavItemActive('/profile') ? '#2c2c2c' : '#8f8f8f'}
              width="36px"
              height="36px"></PersonOutlineIcon>
            <p
              className={
                isNavItemActive('/profile')
                  ? 'navbarListItemNameActive'
                  : 'navbarListItemName'
              }>
              Profile
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Navbar;
