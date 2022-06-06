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

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listings = [];
        const listingsRef = collection(db, 'Listings');

        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timeStamp', 'desc'),
          limit(10)
        );

        const queryResults = await getDocs(q);

        const lastVisible = queryResults.docs[queryResults.docs.length - 1];
        setLastFetchedListing(lastVisible);

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
  }, [params.categoryName]);

  const fetchMoreListings = async () => {
    try {
      const listings = [];
      const listingsRef = collection(db, 'Listings');

      const q = query(
        listingsRef,
        where('type', '==', params.categoryName),
        orderBy('timeStamp', 'desc'),
        limit(10),
        startAfter(lastFetchedListing)
      );

      const queryResults = await getDocs(q);

      const lastVisible = queryResults.docs[queryResults.docs.length - 1];
      setLastFetchedListing(lastVisible);

      queryResults.forEach((doc) => {
        listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Error fetching listings.');
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === 'rent'
            ? 'Places For Rent'
            : 'Places For Sale'}
        </p>
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
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={fetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No Listings For {params.categoryName}</p>
      )}
    </div>
  );
}

export default Category;
