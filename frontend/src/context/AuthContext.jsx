import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import api from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    const { data } = await api.get("/profile/me")
    setUser(data)
  }

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await fetchProfile()
      } catch (error) {
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [token])

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload)
    localStorage.setItem("token", data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload)
    localStorage.setItem("token", data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (payload) => {
    const { data } = await api.put("/profile/me", payload)
    setUser(data)
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, updateProfile }),
    [user, token, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
