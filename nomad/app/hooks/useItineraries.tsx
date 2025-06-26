// import { useState, useEffect } from "react";
// import { getAllItineraries } from "../data/itineraryDb";

// export function useItineraries() {
//   const [itineraries, setItineraries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//    setLoading(true);
//     getAllItineraries()
//       .then((data) => {
//         setItineraries(data);
//         setError(null);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false));
//       }, []);
//       return { itineraries, loading, error, refresh:() => getAllItineraries().then(setItineraries).catch(setError) }};
