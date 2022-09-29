import request from 'superagent';
import { Output } from './interface-v2';

export class Base {
  protected userAgent = '127.0.0.1'; // User-Agent
  constructor() {}

  protected objectToQueryString(object: Record<string, any>, exclude: string[] = []): string {
    let str = Object.keys(object)
      .filter(key => !exclude.includes(key))
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(object[key]);
      })
      .join('&');
    if (str) str = '?' + str;
    return str || '';
  }
  /**
   * post 请求
   * @param url  请求接口
   * @param params 请求参数
   */
  protected async postRequest(url: string, params: Record<string, any>, authorization: string): Promise<Record<string, any>> {
    try {
      const result = await request
        .post(url)
        .send(params)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });
      return {
        status: result.status,
        ...result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
  /**
   * post 请求 V2
   * @param url  请求接口
   * @param params 请求参数
   */
  protected async postRequestV2(url: string, params: Record<string, any>, authorization: string, headers = {}): Promise<Output> {
    try {
      const result = await request
        .post(url)
        .send(params)
        .set({
          ...headers,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });
      return {
        status: result.status,
        data: result.body,
      };
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status as number,
        error: err.response.text && JSON.parse(err.response.text),
      };
    }
  }
  /**
   * get 请求
   * @param url  请求接口
   * @param query 请求参数
   */
  protected async getRequest(url: string, authorization: string, query: Record<string, any> = {}): Promise<Record<string, any>> {
    try {
      const result = await request
        .get(url)
        .query(query)
        .set({
          Accept: 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });

      let data = {};
      switch (result.type) {
        case 'application/json':
          data = {
            status: result.status,
            ...result.body,
          };
          break;
        case 'text/plain':
          data = {
            status: result.status,
            data: result.text,
          };
          break;
        case 'application/x-gzip':
          data = {
            status: result.status,
            data: result.body,
          };
          break;
        default:
          data = {
            status: result.status,
            ...result.body,
          };
      }
      return data;
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        ...(err.response.text && JSON.parse(err.response.text)),
      };
    }
  }
  /**
   * get 请求 v2
   * @param url  请求接口
   * @param query 请求参数
   */
  protected async getRequestV2(url: string, authorization: string, query: Record<string, any> = {}): Promise<Output> {
    try {
      const result = await request
        .get(url)
        .query(query)
        .set({
          Accept: 'application/json',
          'User-Agent': this.userAgent,
          Authorization: authorization,
          'Accept-Encoding': 'gzip',
        });

      let data: any = {};
      switch (result.type) {
        case 'application/json':
          data = {
            status: result.status,
            data: result.body,
          };
          break;
        case 'text/plain':
          data = {
            status: result.status,
            data: result.text,
          };
          break;
        case 'application/x-gzip':
          data = {
            status: result.status,
            data: result.body,
          };
          break;
        default:
          data = {
            status: result.status,
            data: result.body,
          };
      }
      return data;
    } catch (error) {
      const err = JSON.parse(JSON.stringify(error));
      return {
        status: err.status,
        error: err.response.text && JSON.parse(err.response.text),
      };
    }
  }
}
