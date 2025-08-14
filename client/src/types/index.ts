// 违规行为类型
export interface Violation {
  type: '严重违规' | '一般违规';
  category: string;
  description: string;
  coordinates: [number, number, number, number]; // [x1, y1, x2, y2]
  regulations: Regulation[];
  suggestions: string[];
  severity: 'high' | 'medium' | 'low';
  risk_level: string;
}

// 法规条例
export interface Regulation {
  code: string;
  article: string;
  content: string;
}

// 分析摘要
export interface AnalysisSummary {
  severe_count: number;
  normal_count: number;
  total_score: number;
  overall_assessment: string;
  priority_actions: string[];
}

// AI分析结果
export interface AnalysisResult {
  violations: Violation[];
  summary: AnalysisSummary;
}

// 上传的文件信息
export interface UploadedFile {
  filename: string;
  originalName: string;
  url: string;
  path: string;
  size: number;
  imageInfo: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  uploadTime: string;
}

// 完整的分析数据
export interface AnalysisData {
  imageUrl: string;
  analysis: AnalysisResult;
  timestamp: string;
  processingTime?: number;
}

// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 上传响应
export interface UploadResponse extends ApiResponse<UploadedFile> {}

// 分析响应
export interface AnalysisResponse extends ApiResponse<AnalysisData> {}

// 批量分析结果
export interface BatchAnalysisResult {
  index: number;
  imageUrl: string;
  imagePath?: string;
  analysis?: AnalysisResult;
  error?: string;
  success: boolean;
}

// 批量分析响应
export interface BatchAnalysisResponse extends ApiResponse<{
  results: BatchAnalysisResult[];
  summary: {
    total_images: number;
    success_count: number;
    failed_count: number;
    total_violations: number;
  };
  timestamp: string;
}> {}

// 图片标注配置
export interface AnnotationConfig {
  severeColor: string;
  normalColor: string;
  lineWidth: number;
  fontSize: number;
  fontFamily: string;
  showLabels: boolean;
  labelBackground: string;
  labelTextColor: string;
}

// 组件Props类型
export interface UploadSectionProps {
  uploadedFile: UploadedFile | null;
  analysisData: AnalysisData | null;
  isAnalyzing: boolean;
  onFileUploaded: (file: UploadedFile) => void;
  onAnalysisStart: () => void;
  onAnalysisComplete: (data: AnalysisData) => void;
  onAnalysisError: (error: string) => void;
  onReAnalyze: () => void;
}

export interface AnalysisResultProps {
  data: AnalysisData;
  onReAnalyze: () => void;
}

export interface HeaderProps {
  hasData: boolean;
  onClear: () => void;
}

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  description?: string;
}

export interface ImageAnnotationProps {
  imageUrl: string;
  violations: Violation[];
  imageInfo?: {
    width: number;
    height: number;
  };
  config?: Partial<AnnotationConfig>;
  onViolationClick?: (violation: Violation, index: number) => void;
}

export interface ViolationListProps {
  violations: Violation[];
  onViolationClick?: (violation: Violation, index: number) => void;
  selectedViolation?: number | null;
}

export interface StatisticsCardProps {
  summary: AnalysisSummary;
  totalViolations: number;
}

// 历史记录
export interface AnalysisHistory {
  id: string;
  imageUrl: string;
  imageName: string;
  analysis: AnalysisResult;
  timestamp: string;
  processingTime: number;
}

// 导出配置
export interface ExportConfig {
  includeImage: boolean;
  includeAnnotations: boolean;
  includeDetails: boolean;
  format: 'pdf' | 'excel' | 'word';
  imageQuality: number;
}

// 系统配置
export interface SystemConfig {
  maxFileSize: number;
  allowedFormats: string[];
  apiTimeout: number;
  retryAttempts: number;
  batchSize: number;
}

// 错误类型
export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// 性能监控
export interface PerformanceMetrics {
  uploadTime: number;
  analysisTime: number;
  renderTime: number;
  totalTime: number;
  fileSize: number;
  imageResolution: string;
}

// 用户偏好设置
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh-CN' | 'en-US';
  autoAnalyze: boolean;
  showTooltips: boolean;
  annotationConfig: AnnotationConfig;
  exportFormat: ExportConfig['format'];
}

// 分析统计
export interface AnalysisStats {
  totalAnalyzed: number;
  severeViolationsFound: number;
  normalViolationsFound: number;
  averageScore: number;
  mostCommonViolation: string;
  analysisHistory: AnalysisHistory[];
}
