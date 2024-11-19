import axios from 'axios';
const ISLOCAL = true;
const BASE_URL = ISLOCAL ? 'http://localhost:8080/api' : '/api';
export const BASE_URL2 = ISLOCAL ? 'http://localhost:8080/api' : 'https://cougarecho-4.uc.r.appspot.com/api';

export default axios.create({
    baseURL: BASE_URL
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});