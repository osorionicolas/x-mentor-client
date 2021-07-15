import { useContext, useMemo } from 'react'
import axios from 'axios'
import { AuthContext } from '../providers/AuthProvider'
import { useHistory } from "react-router-dom"

const WithAxios = ({ children }) => {
  const { isLoggedIn, getTokens, logout } = useContext(AuthContext)
  const history = useHistory()

    useMemo(() => {
      axios.interceptors.request.use((config) => {
        if(isLoggedIn && getTokens()){
          config.headers.Authorization = `Bearer ${getTokens().accessToken.value}`
        }
        return config
      }, error => {
        return Promise.reject(error)
      })

      axios.interceptors.response.use(response => {
        console.log(response.status)
        if (response.status === 302) {
          console.log(response)
          history.push('/')
        }
        return response
      }, 
      error => {
        if (error.response.status === 401) {
          logout()
        }

        if (error.response.status === 404) {
          history.push('/not-found')
        }

        return Promise.reject(error)
      })
    })
    return children
}

export default WithAxios