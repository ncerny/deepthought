// API configuration
// Update PROD_API_URL after deploying the Cloudflare Worker
const PROD_API_URL = 'https://deepthought-api.ncerny.workers.dev';
const DEV_API_URL = 'http://localhost:8787';

export const API_URL = import.meta.env.PROD ? PROD_API_URL : DEV_API_URL;
