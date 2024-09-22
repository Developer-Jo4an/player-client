import axios from "axios";
import ApiError from "./ApiError";
import md5 from "md5";


const now = 111// Date.now();

const prefix = "/api/v1";

function isAbsolute(str) {
  return /^(\w+:)?\/\//.test(str);
}

function hasPrefix(method, prefix) {
  return prefix && method.indexOf(prefix) === 0;
}

function getURL(method) {
  if (isAbsolute(method) || hasPrefix(method, prefix)) {
    return method;
  }

  return `${prefix}${method}`;
}

function initMethod(method) {
  return (apiMethod, data = {}, generateIdempotencyKey) => {
    const headers = {};
    if (generateIdempotencyKey) {
      const idempotencyKey = getIdempotencyKey(data);
      if (idempotencyKey)
        headers["Idempotency-Key"] = idempotencyKey;
    }
    return send({method, headers, apiMethod, data})
  };
}

function getIdempotencyKey(data) {
  if (!data) return;

  const prefix = `${now}${navigator.userAgent}`;

  if (data instanceof FormData) {
    let str = "";

    for (let pair of data.entries()) {
      const value = pair[1];

      if (!value) return;

      if (value instanceof File) str += String("" + value.size + value.name)
      else if (typeof value === "object") str += JSON.stringify(value)
      else str += String(value);
    }
    return md5(prefix + str);
  } else if (typeof data === "object") return md5(prefix + JSON.stringify(data));
  else return md5(prefix + String(data));
}


let globalHeaders = {};
export function addHeaders(_headers) {
  Object.keys(_headers)
    .forEach(key => {
      if (key === false) {
        delete globalHeaders[key];
      } else {
        globalHeaders[key] = _headers[key];
      }
    })
}

export const get = initMethod("get");
export const post = initMethod("post");

export function send({apiMethod, ...params}) {
  const data = new URLSearchParams();
  if (params.data) {
    Object.entries(params.data).forEach(([key, value]) => {
      data.append(key, typeof value === "object" ? JSON.stringify(value) : value);
    })
  }
  return axios({
    ...params,
    data,
    headers: {
      ...globalHeaders,
      ...params?.headers,
    },
    url: getURL(apiMethod)
  })
    .then(onSuccess, onFail);
}

/**
 *
 * @param {{data, status, statusText, headers, config}} response
 * @return {*}
 */
function onSuccess(response) {
  const {data} = response;
  if (ApiError.isError(data)) {
    throw ApiError.fromApiResponse(data);
  }
  return data.data;
}

function onFail(error) {
  if (error.response && typeof error.response.data === "object") {
    throw ApiError.fromApiResponse(error.response.data);
  } else if (error.request) {
    throw ApiError.fromHttpError(error.request);
  } else {
    throw new ApiError({});
  }
}
