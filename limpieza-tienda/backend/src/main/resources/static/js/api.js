/* ============================================================================
   Cliente HTTP de la API REST (misma app Spring Boot → rutas relativas)
   ========================================================================== */
window.API = (function () {
  async function request(method, path, body, headers = {}) {
    const options = { method, headers: { ...headers } };
    if (body !== undefined) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
    const res = await fetch(path, options);
    if (!res.ok) {
      let message = 'Error ' + res.status;
      try {
        const data = await res.json();
        message = data.message || message;
      } catch (_) { /* respuesta no JSON */ }
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    del: (path) => request('DELETE', path),
    request,
  };
})();
