// import axios from "axios";
const axios = require("axios");
const API_ROOT = "http://famoz.synology.me:5000/webapi/";

let web = {};

web._request = (method = "GET", url, params, data, headers) => {
  return axios.request({
      method,
      headers,
      url,
      params,
      data,
      baseURL: API_ROOT,
      timeout: 30000
    }).then((res) => {
      console.log(`d: `, res.data); 
      // Promise.resolve(res);
      return res.data;
    }).catch(error => {
     console.log(error); 
    //  Promise.reject(error.response);
     throw error.response;
    });
};

web.post = (url, value, headers = {}) => {
  return web._request("POST", url, {}, value, headers);
};

web.upload = (url, body, header = {}) => {
  let _axios = axios.create({
    baseURL: API_ROOT,
    headers: header
  });
  console.log("body : ", body);
  return _axios.post(url, body);
};

web.patch = (url, value, headers = {}) => {
  const data = new URLSearchParams();

  for (const key in value)
    if (value[key] !== null) data.append(key, value[key]);

  return web._request("PATCH", url, {}, data, headers);
};

web.put = (url, value, headers = {}) => {
  const data = new URLSearchParams();

  for (const key in value)
    if (value[key] !== null) data.append(key, value[key]);

  return web._request("PUT", url, {}, data, headers);
};

web.delete = (url, value, headers = {}) => {
  const data = new URLSearchParams();

  for (const key in value)
    if (value[key] !== null) data.append(key, value[key]);

  return web._request("DELETE", url, {}, data, headers);
};

web.get = (url, value, headers = {}) => {
  const data = new URLSearchParams();
  for (const key in value)
    if (value[key] !== null) data.append(key, value[key]);

  return web._request("GET", url, data, {}, headers);
};

module.exports = web;
