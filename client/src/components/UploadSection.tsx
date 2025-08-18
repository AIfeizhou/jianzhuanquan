import React, { useState, useCallback } from 'react';
import { Card, Upload, Button, Space, Typography, Image, Progress, Alert, message } from 'antd';
import { 
  CloudUploadOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  ScanOutlined,
  FileImageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { UploadSectionProps } from '../types';
import { uploadImage, analyzeImage } from '../services/api';
import './UploadSection.css';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const UploadSection: React.FC<UploadSectionProps> = ({
  uploadedFile,
  analysisData,
  isAnalyzing,
  onFileUploaded,
  onAnalysisStart,
  onAnalysisComplete,
  onAnalysisError,
  onReAnalyze
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  // 处理文件上传前的验证
  const beforeUpload = useCallback((file: File) => {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      message.error('只支持 JPG、PNG、BMP、WebP 格式的图片！');
      return false;
    }

    // 检查文件大小（20MB）
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('文件大小不能超过 20MB！');
      return false;
    }

    // 检查图片分辨率（可选）
    return new Promise<boolean>((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (img.width < 480 || img.height < 360) {
          message.warning('建议上传分辨率不低于 480x360 的图片以获得更好的分析效果');
        }
        resolve(true);
      };
      img.onerror = () => {
        message.error('无法读取图片文件！');
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 自定义上传处理
  const customUpload = useCallback(async (options: any) => {
    const { file, onProgress, onSuccess, onError } = options;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // 创建FormData
      const formData = new FormData();
      formData.append('image', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 100);

      // 调用上传API
      const response = await uploadImage(formData, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
          onProgress({ percent });
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success && response.data) {
        onSuccess(response.data);
        onFileUploaded(response.data);
        message.success('图片上传成功！');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('上传失败:', error);
      onError(error);
      message.error(`上传失败: ${error.message || '网络错误'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onFileUploaded]);

  // 开始分析
  const handleStartAnalysis = useCallback(async () => {
    if (!uploadedFile) {
      message.warning('请先上传图片');
      return;
    }

    try {
      onAnalysisStart();
      
      const response = await analyzeImage({
        imageUrl: uploadedFile.url,
        imagePath: uploadedFile.path
      });

      if (response.success && response.data) {
        onAnalysisComplete(response.data);
      } else {
        throw new Error(response.message || '分析失败');
      }
    } catch (error: any) {
      console.error('分析失败:', error);
      onAnalysisError(error.message || '分析失败，请稍后重试');
    }
  }, [uploadedFile, onAnalysisStart, onAnalysisComplete, onAnalysisError]);

  // 预览图片
  const handlePreview = useCallback(() => {
    if (uploadedFile?.url) {
      setPreviewImage(uploadedFile.url);
      setPreviewVisible(true);
    }
  }, [uploadedFile]);

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'image',
    multiple: false,
    showUploadList: false,
    beforeUpload,
    customRequest: customUpload,
    accept: 'image/*',
  };

  return (
    <div className="upload-section">
      <Card className="upload-card" variant="borderless">
        <div className="upload-header">
          <Title level={2} className="upload-title">
            <FileImageOutlined className="title-icon" />
            图片上传与分析
          </Title>
          <Paragraph className="upload-description">
            上传建筑施工现场图片，AI将自动识别安全违规行为并提供专业整改建议
          </Paragraph>
        </div>

        {!uploadedFile ? (
          // 上传区域
          <div className="upload-area">
            <Dragger {...uploadProps} className="upload-dragger">
              <div className="upload-content">
                <div className="upload-icon">
                  <CloudUploadOutlined />
                </div>
                <Title level={4} className="upload-text">
                  点击或拖拽文件到此区域上传
                </Title>
                <Text className="upload-hint">
                  支持 JPG、PNG、BMP、WebP 格式，文件大小不超过 20MB
                </Text>
                <div className="upload-features">
                  <Space size="large">
                    <div className="feature-tag">
                      <InfoCircleOutlined /> 智能识别
                    </div>
                    <div className="feature-tag">
                      <ScanOutlined /> 实时分析
                    </div>
                    <div className="feature-tag">
                      <EyeOutlined /> 可视化标注
                    </div>
                  </Space>
                </div>
              </div>
            </Dragger>

            {/* 上传进度 */}
            {isUploading && (
              <div className="upload-progress">
                <Progress 
                  percent={uploadProgress} 
                  status="active"
                  strokeColor="#1890ff"
                />
                <Text className="progress-text">正在上传图片...</Text>
              </div>
            )}

            {/* 使用说明 */}
            <Alert
              message="使用建议"
              description={
                <ul className="upload-tips">
                  <li>建议上传清晰的施工现场照片，分辨率不低于 480x360</li>
                  <li>确保图片中的安全设施和作业人员清晰可见</li>
                  <li>避免过度曝光或阴暗的照片，以获得更准确的分析结果</li>
                  <li>支持多角度拍摄，包括全景和细节特写</li>
                </ul>
              }
              type="info"
              showIcon
              className="upload-tips-alert"
            />
          </div>
        ) : (
          // 已上传文件信息
          <div className="uploaded-file">
            <div className="file-preview">
              <div className="preview-image">
                <img 
                  src={uploadedFile?.url || ''} 
                  alt={uploadedFile?.originalName || '上传的图片'}
                  className="uploaded-image"
                />
                <div className="preview-overlay">
                  <Button 
                    type="primary" 
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    className="preview-button"
                  >
                    预览
                  </Button>
                </div>
              </div>
              
              <div className="file-info">
                <Title level={4} className="file-name">
                  {uploadedFile?.originalName || '未知文件'}
                </Title>
                <div className="file-details">
                  <Space direction="vertical" size="small">
                    <Text>
                      <strong>尺寸:</strong> {uploadedFile?.imageInfo?.width || 0} × {uploadedFile?.imageInfo?.height || 0}
                    </Text>
                    <Text>
                      <strong>大小:</strong> {((uploadedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                    </Text>
                    <Text>
                      <strong>格式:</strong> {uploadedFile?.imageInfo?.format?.toUpperCase() || '未知'}
                    </Text>
                    <Text>
                      <strong>上传时间:</strong> {uploadedFile?.uploadTime ? new Date(uploadedFile.uploadTime).toLocaleString() : '未知'}
                    </Text>
                  </Space>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="file-actions">
              <Space size="large">
                {!analysisData && !isAnalyzing && (
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<ScanOutlined />}
                    onClick={handleStartAnalysis}
                    className="analyze-button"
                  >
                    开始AI分析
                  </Button>
                )}
                
                {analysisData && (
                  <Button 
                    type="default" 
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={onReAnalyze}
                    className="reanalyze-button"
                  >
                    重新分析
                  </Button>
                )}

                <Button 
                  type="default" 
                  size="large"
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="upload-new-button"
                >
                  上传新图片
                </Button>
              </Space>
            </div>

            {/* 分析状态 */}
            {isAnalyzing && (
              <div className="analysis-status">
                <Alert
                  message="正在分析中..."
                  description="AI正在识别图片中的建筑安全违规行为，请稍候片刻"
                  type="info"
                  showIcon
                  className="analysis-alert"
                />
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 图片预览模态框 */}
      <Image
        width={200}
        style={{ display: 'none' }}
        src={previewImage}
        preview={{
          visible: previewVisible,
          src: previewImage,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />
    </div>
  );
};

export default UploadSection;
