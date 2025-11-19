import { request } from './http.js'

// 本地会话与用户存储 key（演示模式）
const AUTH_USER_KEY = 'auth_user'
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_EXPIRES_KEY = 'auth_expires'
// 本地用户注册表（仅演示），真实接后端后可移除
const USER_PREFIX = 'user:'

// 会话保存（默认 7 天）
export function saveSession({ user, token = 'mock-token', ttlMs = 7 * 24 * 60 * 60 * 1000 }) {
  const now = Date.now()
  try {
    uni.setStorageSync(AUTH_USER_KEY, user)
    uni.setStorageSync(AUTH_TOKEN_KEY, token)
    uni.setStorageSync(AUTH_EXPIRES_KEY, now + ttlMs)
  } catch(e) {}
}

export function getSession() {
  try {
    const user = uni.getStorageSync(AUTH_USER_KEY)
    const token = uni.getStorageSync(AUTH_TOKEN_KEY)
    const exp = uni.getStorageSync(AUTH_EXPIRES_KEY)
    if (!user || !token || !exp) return null
    if (Date.now() > Number(exp)) {
      logout()
      return null
    }
    return { user, token, expiresAt: Number(exp) }
  } catch(e) {
    return null
  }
}

export function isLoggedIn() {
  return !!getSession()
}

export function logout() {
  try {
    uni.removeStorageSync(AUTH_USER_KEY)
    uni.removeStorageSync(AUTH_TOKEN_KEY)
    uni.removeStorageSync(AUTH_EXPIRES_KEY)
  } catch(e) {}
}

// 当未配置后端 baseURL 时，使用本地存储模拟注册/登录（演示用）
function isMock(){
  return true // 如需接入后端，把这里改为根据后端 baseURL 是否存在进行判定
}

export async function register(name, password){
  if(isMock()){
    if(!name || !password) throw new Error('请输入用户名和密码')
    // 模拟唯一性校验
    const exists = uni.getStorageSync(USER_PREFIX + name)
    if (exists) throw new Error('用户名已存在')
    // 保存“注册表”记录（演示，明文仅用于本地）
    uni.setStorageSync(USER_PREFIX + name, { name, password })
    const user = { id: Date.now(), name }
    return { ok: true, user }
  }
  return request({ url:'/auth/register', method:'POST', data:{ name, password } })
}

export async function login(name, password){
  if(isMock()){
    const rec = uni.getStorageSync(USER_PREFIX + name)
    if(rec && rec.password === password){
      const user = { id: Date.now(), name }
      saveSession({ user })
      return { ok:true, token:'mock-token', user }
    }
    throw new Error('账号或密码错误')
  }
  const result = await request({ url:'/auth/login', method:'POST', data:{ name, password } })
  // 真实后端返回结构：{ ok, token, user, expiresIn }
  if (result?.ok) {
    saveSession({ user: result.user, token: result.token, ttlMs: (result.expiresIn||7*24*60*60)*1000 })
  }
  return result
}

export function getCurrentUser(){
  const s = getSession()
  return s ? s.user : null
}
