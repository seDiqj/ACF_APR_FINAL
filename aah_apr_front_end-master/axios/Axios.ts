import axios, { Axios, AxiosError, AxiosResponse } from "axios";

class RequestHandler {
  // Base configs for request handling.
  private config: Record<string, string | null | undefined | boolean> = {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api",
    token: this.getCookie("access_token"),
    withCredentials: true,
  };

  // Lock's the request to prevent repetation of request to a url
  private requestLock: boolean = false;

  // Global axios Instance.
  private axiosInstance: Axios | null = null;

  // Result of request.
  private result: Promise<AxiosResponse<any, any, {}>> | undefined = undefined;

  constructor(baseUrl?: string) {
    if (baseUrl) this.config.baseURL = baseUrl;
    this.axiosInstance = this.createAxiosInstance();
  }

  public get(url: string): RequestHandler | undefined {
    if (this.isLocked()) return;
    this.lockRequest();

    this.result = this.axiosInstance?.get(url);
    return this;
  }

  public post(url: string, data?: any): RequestHandler | undefined {
    if (this.isLocked()) return;
    this.lockRequest();

    this.result = this.axiosInstance?.post(url, data ?? undefined);
    return this;
  }

  public put(url: string, data?: any): RequestHandler | undefined {
    if (this.isLocked()) return;
    this.lockRequest();
    this.result = this.axiosInstance?.put(url, data ?? undefined);
    return this;
  }

  public delete(url: string, data?: any): RequestHandler | undefined {
    if (this.isLocked()) return;
    this.lockRequest();
    this.result = this.axiosInstance?.delete(url);
    return this;
  }

  public request(
    url: string,
    method: string,
    data?: any,
  ): RequestHandler | undefined {
    if (this.isLocked()) return;

    if (this.isGetMethod(method)) {
      return this.get(url);
    } else if (this.isPostMethod(method)) {
      return this.post(url, data);
    } else if (this.isPutMethod(method)) {
      return this.put(url, data);
    } else if (this.isDeleteMethod(method)) {
      return this.delete(url, data);
    }
  }

  public then(handler: (response: AxiosResponse) => void) {
    this.result?.then(handler);
    return this;
  }

  public catch(handler: (error: AxiosError) => void) {
    this.result?.catch(handler);
    return this;
  }

  public finally(handler: VoidFunction) {
    this.result?.finally(() => {
      handler();
      this.releaseRequestLock();
    });
    return this;
  }

  private lockRequest() {
    this.requestLock = true;
  }

  private releaseRequestLock() {
    this.requestLock = false;
  }

  private isLocked() {
    return this.requestLock;
  }

  private isGetMethod(method: string) {
    return method == "get";
  }

  private isPostMethod(method: string) {
    return method == "post";
  }

  private isPutMethod(method: string) {
    return method == "put";
  }

  private isDeleteMethod(method: string) {
    return method == "delete";
  }

  private whichMethodIs(
    method: string,
  ): "get" | "post" | "put" | "delete" | undefined {
    if (this.isGetMethod(method)) return "get";
    else if (this.isPostMethod(method)) return "post";
    else if (this.isPutMethod(method)) return "put";
    else if (this.isDeleteMethod(method)) return "delete";
  }

  private createAxiosInstance = () => {
    const token = this.getCookie("access_token");

    return axios.create({
      baseURL: (this.config.baseURL as string) ?? undefined,
      headers: {
        Authorization: token ? `Bearer ${this.config.token}` : "",
      },
      withCredentials: this.config.withCredentials as boolean,
    });
  };

  private getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }
}

export default RequestHandler;
