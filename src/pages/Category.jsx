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

function Category() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

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
        queryResults.forEach((doc) => {
          const data = doc.data();
          console.log(doc.data());
          listings.push(data);
        });
      } catch (error) {
        console.log(error);

        toast.error('Error fetching listings.');
      }
    };
    fetchListings();
  });

  return <div>Category</div>;
}

export default Category;
