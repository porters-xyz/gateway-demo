import { JsonRpcProvider, FetchRequest } from "ethers";

export class PortersJsonRpcProvider extends JsonRpcProvider {
  async fetchData<T = any>(request: FetchRequest): Promise<T> {
    const url = new URL(request.url);
    console.log('calling endpoint', {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: request.method || 'POST',
      headers: {
        ...request.headers,
        Host: url.hostname,
      },
    });

    // Ensure the Host header is set
    request.headers['Host'] = url.hostname;

    // Perform the HTTP request using fetch
    const response = await fetch(request.url, {
      method: request.method || 'POST',
      headers: request.headers,
      body: request.body,
    });

    const body = await response.json();
    return body as T;
  }
}
