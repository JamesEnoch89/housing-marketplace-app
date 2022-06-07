/* eslint-disable default-case */
import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

function EditListing(props) {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(false);
  const [listingData, setListingData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = listingData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();
  const isMounted = useRef(true);

  // redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser.uid) {
      toast.error(
        'You can not edit this listing. You are not the listing creator.'
      );
      navigate('/');
    }
  }, [navigate]);

  // get listing to edit
  useEffect(() => {
    setLoading(true);
    const getListing = async () => {
      const docRef = doc(db, 'Listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setListingData({ ...docSnap.data(), address: docSnap.data().location });
        setLoading(false);
      } else {
        navigate('/');
        toast.error('Listing does not exist');
      }
    };

    getListing();
  }, [navigate, params.listingId]);

  // set user ref to logged in user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setListingData({ ...listingData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    handleFormValidation();

    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      //google resp
      const noResultsCode = 'ZERO_RESULTS';
      const route = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`;
      const response = await fetch(route);
      const data = await response.json();

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.long = data.results[0]?.geometry.location.lng ?? 0;

      location =
        data.status === noResultsCode
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined) {
        setLoading(false);
        toast.error('Please enter a valid address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.long = longitude;
    }

    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Error uploading image');
    });

    const formDataCopy = {
      ...listingData,
      imageUrls,
      geolocation,
      timeStamp: serverTimestamp(),
    };

    // delete fields not stored here
    // images handled by image urls
    // address handled by location
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // update listing
    const docRef = doc(db, 'Listings', params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success('Listing saved successfully');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const handleFormValidation = () => {
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error(
        'Error: Discounted price must be less than the regular price'
      );
      return;
    }

    if (images > 6) {
      setLoading(false);
      toast.error('Error: Maximum number of images is 6');
      return;
    }
  };

  const onMutate = (event) => {
    let isBoolean = null;
    if (event.target.value === 'true') {
      isBoolean = true;
    }
    if (event.target.value === 'false') {
      isBoolean = false;
    }
    updateFiles(event);
    updateFields(event, isBoolean);
  };

  const updateFiles = (event) => {
    // update files
    if (event.target.files) {
      setListingData((prevState) => ({
        ...prevState,
        images: event.target.files,
      }));
    }
  };

  const updateFields = (event, isBoolean) => {
    // update bools/text/numbers
    if (!event.target.files) {
      setListingData((prevState) => ({
        ...prevState,
        [event.target.id]: isBoolean ?? event.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner></Spinner>;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit a Listing</p>
      </header>

      <main>
        <form onSubmit={onSubmit}>
          <label htmlFor="Sell or Rent" className="formLabel">
            Sell / Rent
          </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="sale"
              onClick={onMutate}>
              Sell
            </button>
            <button
              type="button"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id="type"
              value="rent"
              onClick={onMutate}>
              Rent
            </button>
          </div>

          <label htmlFor="name" className="formLabel">
            Name
          </label>
          <input
            type="text"
            className="formInputName"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />

          <div className="formRooms flex">
            <div>
              <label htmlFor="" className="formLabel">
                Bedrooms
              </label>
              <input
                className="formInputSmall"
                type="number"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label htmlFor="" className="formLabel">
                Bathrooms
              </label>
              <input
                className="formInputSmall"
                type="number"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label htmlFor="" className="formLabel">
            Parking Spot
          </label>
          <div className="formButtons">
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type="button"
              id="parking"
              value={true}
              onClick={onMutate}>
              Yes
            </button>

            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="parking"
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label htmlFor="furnished" className="formLabel">
            Furnished
          </label>
          <div className="formButtons">
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type="button"
              id="furnished"
              value={true}
              onClick={onMutate}>
              Yes
            </button>

            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type="button"
              id="furnished"
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label htmlFor="address" className="formLabel">
            Address
          </label>
          <textarea
            name="address"
            id="address"
            value={address}
            onChange={onMutate}
            className="formInputAddress"
            required></textarea>

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label htmlFor="latitude" className="formLabel">
                  Latitude
                </label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude" className="formLabel">
                  Longitude
                </label>
                <input
                  type="number"
                  className="formInputSmall"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label htmlFor="offer" className="formLabel">
            Offer
          </label>
          <div className="formButtons">
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}>
              Yes
            </button>

            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}>
              No
            </button>
          </div>

          <label htmlFor="regular price" className="formLabel">
            Regular Price
          </label>
          <div className="formPriceDiv">
            <input
              type="number"
              className="formInputSmall"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label htmlFor="discounted price" className="formLabel">
                Discounted Price
              </label>
              <div className="formPriceDiv">
                <input
                  type="number"
                  className="formInputSmall"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min="50"
                  max="750000000"
                  required
                />
                {type === 'rent' && <p className="formPriceText">$ / Month</p>}
              </div>
            </>
          )}
          <label htmlFor="" className="formLabel">
            Images
          </label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            type="file"
            className="formInputFile"
            id="images"
            onChange={onMutate}
            max="6"
            min="0"
            accept=".jpg, .jpeg, .png"
            multiple
            required
          />
          <button className="primaryButton EditListingButton" type="submit">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default EditListing;
