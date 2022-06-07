import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Offers() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = [];
        const listingsRef = collection(db, 'Listings');

        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timeStamp', 'desc'),
          limit(25)
        );

        const queryResults = await getDocs(q);

        // const lastVisible = queryResults.docs[queryResults.docs.length - 1];
        // setLastFetchedListing(lastVisible);

        queryResults.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Error fetching listings.');
      }
    };
    fetchListings();
  }, []);

  // const fetchMoreListings = async () => {
  //   try {
  //     const listings = [];
  //     const listingsRef = collection(db, 'Listings');

  //     const q = query(
  //       listingsRef,
  //       where('offer', '==', true),
  //       orderBy('timeStamp', 'desc'),
  //       limit(10),
  //       startAfter(lastFetchedListing)
  //     );

  //     const queryResults = await getDocs(q);

  //     const lastVisible = queryResults.docs[queryResults.docs.length - 1];
  //     setLastFetchedListing(lastVisible);

  //     queryResults.forEach((doc) => {
  //       listings.push({
  //         id: doc.id,
  //         data: doc.data(),
  //       });
  //     });

  //     setListings((prevState) => [...prevState, ...listings]);
  //     setLoading(false);
  //   } catch (error) {
  //     toast.error('Error fetching listings.');
  //   }
  // };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}></ListingItem>
              ))}
            </ul>
          </main>
          {/* <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={fetchMoreListings}>
              Load More
            </p>
          )} */}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
}

export default Offers;
