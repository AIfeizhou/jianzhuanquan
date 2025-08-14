import axios, { AxiosResponse, AxiosProgressEvent } from 'axios';
import { 
  UploadResponse, 
  AnalysisResponse, 
  BatchAnalysisResponse,
  ApiResponse 
} from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加请求时间戳
    config.metadata = { startTime: Date.now() };
    
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`🚀 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ 请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // 计算请求耗时
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    console.log(`✅ API响应: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);
    
    return response;
  },
  (error) => {
    const duration = Date.now() - (error.config?.metadata?.startTime || 0);
    console.error(`❌ API错误: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error);
    
    // 处理不同类型的错误
    if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请检查网络连接';
    } else if (error.response?.status === 413) {
      error.message = '文件太大，请选择小于20MB的图片';
    } else if (error.response?.status === 429) {
      error.message = '请求过于频繁，请稍后再试';
    } else if (error.response?.status >= 500) {
      error.message = '服务器错误，请稍后重试';
    } else if (!error.response) {
      error.message = '网络连接失败，请检查网络设置';
    }
    
    return Promise.reject(error);
  }
);

// 声明模块扩展
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

/**
 * 上传图片
 * @param formData 包含图片文件的FormData
 * @param onProgress 上传进度回调
 * @returns Promise<UploadResponse>
 */
export const uploadImage = async (
  formData: FormData,
  onProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<UploadResponse> => {
  try {
    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
      timeout: 120000, // 2分钟超时，适用于大文件
    });
    
    return response.data;
  } catch (error: any) {
    console.error('图片上传失败:', error);
    throw error;
  }
};

/**
 * 上传Base64图片
 * @param imageData Base64图片数据
 * @param filename 文件名（可选）
 * @returns Promise<UploadResponse>
 */
export const uploadBase64Image = async (
  imageData: string,
  filename?: string
): Promise<UploadResponse> => {
  try {
    const response = await api.post('/upload/base64', {
      imageData,
      filename,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Base64图片上传失败:', error);
    throw error;
  }
};

/**
 * 分析图片
 * @param params 分析参数
 * @returns Promise<AnalysisResponse>
 */
export const analyzeImage = async (params: {
  imageUrl?: string;
  imagePath?: string;
}): Promise<AnalysisResponse> => {
  try {
    const response = await api.post('/analyze', params, {
      timeout: 90000, // 90秒超时，AI分析可能较慢
    });
    
    return response.data;
  } catch (error: any) {
    console.error('图片分析失败:', error);
    throw error;
  }
};

/**
 * 批量分析图片
 * @param images 图片列表
 * @returns Promise<BatchAnalysisResponse>
 */
export const batchAnalyzeImages = async (
  images: Array<{ url?: string; path?: string }>
): Promise<BatchAnalysisResponse> => {
  try {
    const response = await api.post('/analyze/batch', { images }, {
      timeout: 300000, // 5分钟超时，批量分析需要更长时间
    });
    
    return response.data;
  } catch (error: any) {
    console.error('批量分析失败:', error);
    throw error;
  }
};

/**
 * 获取分析历史记录
 * @param page 页码
 * @param limit 每页数量
 * @returns Promise<ApiResponse>
 */
export const getAnalysisHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse> => {
  try {
    const response = await api.get('/analyze/history', {
      params: { page, limit },
    });
    
    return response.data;
  } catch (error: any) {
    console.error('获取历史记录失败:', error);
    throw error;
  }
};

/**
 * 健康检查
 * @returns Promise<ApiResponse>
 */
export const healthCheck = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error: any) {
    console.error('健康检查失败:', error);
    throw error;
  }
};

/**
 * 下载分析报告
 * @param analysisId 分析ID
 * @param format 报告格式
 * @returns Promise<Blob>
 */
export const downloadReport = async (
  analysisId: string,
  format: 'pdf' | 'excel' | 'word' = 'pdf'
): Promise<Blob> => {
  try {
    const response = await api.get(`/report/${analysisId}`, {
      params: { format },
      responseType: 'blob',
    });
    
    return response.data;
  } catch (error: any) {
    console.error('下载报告失败:', error);
    throw error;
  }
};

/**
 * 检查API连接状态
 * @returns Promise<boolean>
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    await healthCheck();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 重试机制包装函数
 * @param fn 要重试的函数
 * @param retries 重试次数
 * @param delay 重试延迟（毫秒）
 * @returns Promise<T>
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) {
        throw error;
      }
      
      console.warn(`重试 ${i + 1}/${retries} 失败:`, error.message);
      
      // 指数退避
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('重试次数已用完');
};

/**
 * 取消令牌管理
 */
export class CancelTokenManager {
  private static tokens: Map<string, AbortController> = new Map();
  
  static create(key: string): AbortSignal {
    // 取消之前的请求
    this.cancel(key);
    
    const controller = new AbortController();
    this.tokens.set(key, controller);
    
    return controller.signal;
  }
  
  static cancel(key: string): void {
    const controller = this.tokens.get(key);
    if (controller) {
      controller.abort();
      this.tokens.delete(key);
    }
  }
  
  static cancelAll(): void {
    this.tokens.forEach((controller) => {
      controller.abort();
    });
    this.tokens.clear();
  }
}

// 导出默认的api实例，供其他模块使用
export default api;
