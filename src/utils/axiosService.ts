import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
const protocolHttps = 'https://'
//10.0.2.2
const host = 'canonguyenhien.com'
const isDev = false
const devHost = 'https://2422-123-20-226-93.ngrok-free.app'
let hostURL = isDev ? devHost : `${protocolHttps}${host}`
let assetURL = `https://` + host;
let baseURL = `${hostURL}/api/`
export { hostURL, baseURL, assetURL }

const axiosService = axios.create({
  timeout: 60 * 1000, //Set 60s for api timeout
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

axiosService.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// Add a response interceptor
axiosService.interceptors.response.use(
  ({ data, ...others }) => {
    const response = typeof data === 'object' ? data : data
    if (response.status === false) {
      return Promise.reject(response)
    }
    return response
  },
  error => {
    if (error.response) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)
axiosService.defaults.baseURL = baseURL
export default axiosService
