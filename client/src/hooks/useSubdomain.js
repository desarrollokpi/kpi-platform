const useSubdomain = () => {
  const subdomain = window.location.host;

  if (subdomain.includes("localhost:")) {
    return null;
    // return "testclientqa";
  }

  return subdomain.split(".")[0];
};

export default useSubdomain;
