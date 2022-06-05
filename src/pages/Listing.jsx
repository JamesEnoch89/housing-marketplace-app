import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from '../components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  // const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      debugger;
      const docRef = doc(db, 'Listings', params.listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data());
        // console.log(listing);
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.listingId]);

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareLinkCopied(true);
    setTimeout(() => {
      setShareLinkCopied(false);
    }, 1500);
  };

  if (loading) {
    return <Spinner></Spinner>;
  }

  if (listing) {
    return (
      <main>
        {/* slider */}

        <div className="shareIconDiv" onClick={shareLink} title="copy link">
          <img src={shareIcon} alt="share" className="shareIcon" />
        </div>

        {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

        <div className="listingDetails">
          <p className="listingName">
            {listing.name} - $
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          </p>
          <p className="listingLocation">{listing.location}</p>
          <p>
            <img
              src={listing.imageUrls[0]}
              alt={listing.name}
              className="categoryListingImg"></img>
          </p>
          <p className="listingType">
            For {listing.type === 'rent' ? 'Rent' : 'Sale'}
          </p>
          {listing.offer && (
            <p className="discountPrice">
              $
              {(listing.regularPrice - listing.discountedPrice)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
              Discount
            </p>
          )}
          <ul className="listingDetailsList">
            <li>
              {listing.bedrooms > 1
                ? `${listing.bedrooms} Bedrooms}`
                : '1 Bedroom'}
            </li>
            <li>
              {listing.bathrooms > 1
                ? `${listing.bathrooms} Bathrooms}`
                : '1 Bathroom'}
            </li>
            <li>{listing.parking && 'Parking Spot'}</li>
            <li>{listing.furnished && 'Furnished'}</li>
          </ul>

          <p className="listingLocationTitle">Location</p>

          <div className="leafletContainer">
            <MapContainer
              style={{ height: '100%', width: '60%' }}
              center={[listing.geolocation.lat, listing.geolocation.long]}
              zoom={13}
              scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="http:osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"></TileLayer>

              <Marker
                position={[listing.geolocation.lat, listing.geolocation.long]}>
                <Popup>{listing.location}</Popup>
              </Marker>
            </MapContainer>
          </div>

          {auth.currentUser?.uid === listing.userRef && (
            <Link
              to={`/contact/${listing.userRef}?listingName=${listing.name}`}
              className="primaryButton">
              Contact Landlord
            </Link>
          )}
        </div>
      </main>
    );
  } else {
    return null;
  }
}

export default Listing;
