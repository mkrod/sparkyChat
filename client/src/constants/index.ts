export const Appname: string = "Sparky";
export const AppLogo: string = "/logo.png";
export const defaultDp: string = "default_dp.jpg";
export const serverURL: string = "https://localhost:3000/api";
export const googleClientID: string = "86436725623-dtnh7ms0ba1hp5c9hned8jefi2h9irsq.apps.googleusercontent.com";
export const googleRedirectURI: string = `${serverURL}/auth/google/callback`;

export const serverRequest = async (
    method: "post" | "get" | "put",
    route: string,
    data?: any,
    type?: "json" | "form" | "formdata"
  ): Promise<Response> => {
    const headers: HeadersInit = {};
  
    if (type === "json") {
      headers["Content-Type"] = "application/json";
    } else if (type === "form") {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // Don't set Content-Type for FormData
  
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
      credentials: "include",
    };
  
    if (method === "post" || method === "put") {
      if (type === "json") {
        options.body = JSON.stringify({ ...data });
      } else if (type === "form") {
        options.body = new URLSearchParams({ ...data }).toString();
      } else if (type === "formdata") {
        options.body = data; // data is already a FormData instance
        // Do not set Content-Type manually
      }
    } else if (method === "get" && data) {
      route += `?${new URLSearchParams(data).toString()}`;
    }
  
    const response = await fetch(`${serverURL}/${route}`, options);
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return response.json() as Promise<Response>;
  };
