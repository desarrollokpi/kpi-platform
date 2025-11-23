const useSubdomain = initialState => {
  let subdomain = window.location.host

  if (subdomain === 'localhost:3000') {
    subdomain = 'testclientqa'
  } else {
    subdomain = subdomain.split('.')[0]
  }

  return subdomain
}

export default useSubdomain
