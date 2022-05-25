import { Link } from 'react-router-dom';
import rentCategoryImage from '../assets/jpg/rentCategoryImage.jpg';
import sellCategoryImage from '../assets/jpg/sellCategoryImage.jpg';

function Explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
      </header>

      <main>
        <p className="exploreCategoryHeading">Explore Categories</p>
        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImage}
              alt="rent"
              className="exploreCategoryImg"></img>
            <p className="exploreCategoryName">Rent</p>
          </Link>
          <Link to="/category/sell">
            <img
              src={sellCategoryImage}
              alt="sell"
              className="exploreCategoryImg"></img>
            <p className="exploreCategoryName">Buy</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Explore;
