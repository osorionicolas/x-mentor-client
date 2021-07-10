import { useContext, useMemo } from 'react'
import axios from 'axios'
import { AuthContext } from '../providers/AuthProvider'

const WithAxios = ({ children }) => {
  const { isLoggedIn, getTokens } = useContext(AuthContext)

    useMemo(() => {
      axios.interceptors.request.use((config) => {
        if(isLoggedIn && getTokens()){
          config.headers.Authorization = `Bearer ${getTokens().accessToken.value}`
        }
        return config
      }, error => {
        return Promise.reject(error)
      })
    })
    return children
}

export default WithAxios