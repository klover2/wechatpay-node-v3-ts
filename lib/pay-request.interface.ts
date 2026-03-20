import { Output } from './interface-v2';

export interface IPayRequest {
  /**
   * post 请求
   * @param url url
   * @param params body
   * @param headers 请求头
   */
  post(url: string, params: Record<string, any>|undefined, headers: Record<string, any>): Promise<Output>;
  /**
   * 上传文件
   * @param url url
   * @param params body
   * @param headers 请求头
   */
  upload(url: string, params: Record<string, any>, headers: Record<string, any>): Promise<Output>;
  /**
   * get 请求
   * @param url url
   * @param headers 请求头
   */
  get(url: string, headers: Record<string, any>): Promise<Output>;
}
