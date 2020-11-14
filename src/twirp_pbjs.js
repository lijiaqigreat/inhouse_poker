import Axios from 'axios';

const getTwirpError = (err) => {
  const resp = err.response;
  let twirpError = {
    code: 'unknown',
    msg: 'unknown error',
    meta: {}
  };

  if (resp) {
    const headers = resp.headers;
    const data = resp.data;

    if (/application\/json/.test(headers['content-type'])) {
      let s = data.toString();

      if (s === "[object ArrayBuffer]") {
        s = new TextDecoder("utf-8").decode(new Uint8Array(data));
      }

      try {
        twirpError = JSON.parse(s);
      } catch (e) {
        twirpError.msg = `JSON.parse() error: ${e.toString()}`
      }
    }
  }

  return twirpError;
};
export const createTwirpRpcImpl(service, baseURL, options = {}) {
  baseURL = baseURL + '/twirp/' + service.fullName.slice(1) + "/"
  const defaultOpts = {
    baseURL,
    headers: {
      Accept: 'application/protobuf'
    }
  }
  const axiosOpts = { ...defaultOpts, ...options }

  const axios = Axios.create(axiosOpts)

  return (method, requestData, callback) => {
    axios({
      method: 'POST',
      url: method.name,
      headers: {
        'Content-Type': 'application/protobuf'
      },
      // required to get an arraybuffer of the actual size, not the 8192 buffer pool that protobuf.js uses
      // see: https://github.com/dcodeIO/protobuf.js/issues/852
      data: requestData.slice(),
      responseType: 'arraybuffer'
    })
      .then((resp) => {
        callback(null, new Uint8Array(resp.data));

      })
      .catch((err) => {
        callback(getTwirpError(err), null);
      });
  }
}
