// export default 'http://localhost:8000';
//export default process.env.NODE_ENV === 'production' ? 'http://nav.kopt.org:8010' : 'http://10.10.77.7:8000';
// export default 'http://10.10.77.7:8000';
// export default 'http://' + location.hostname + ':8000';

export default process.env.NODE_ENV === 'production' ? window.location.origin : 'https://' + location.hostname + ':9000';
// export default window.location.origin;
//export default 'http://nav.kopt.org:8010';
// import 'babel-polyfill';
// import axios from 'axios';

//export default function getUrl(callback) { return axios.get('http://10.10.77.7:8000/ip/').then(res => callback(res.data)); }

// export default async function getUrl() {
//   let response = await axios.get('http://10.10.77.7:8000/ip/');

//   return response;
// }

// export default getUrl();