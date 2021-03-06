export function setInterceptors(instance){
  instance.interceptors.request.use(
    function(config){
      const token = window.localStorage.getItem('access-token')
      if(token)
        config.headers.Authorization = `Bearer ${token}`
      return config
    },
    function(err){
      return Promise.reject(err)
    }
  )

  //response interceptor
  instance.interceptors.response.use(
    function(res){
      return res
    },
    function(err){
      return Promise.reject(err)
    }
  )
  return instance
}