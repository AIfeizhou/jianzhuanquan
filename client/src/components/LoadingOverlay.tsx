import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { LoadingOverlayProps } from '../types';
import './LoadingOverlay.css';

const { Text } = Typography;

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '正在分析中...',
  description = 'AI正在识别图片中的建筑安全违规行为，请稍候片刻'
}) => {
  if (!visible) return null;

  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <div className="loading-animation">
          <Spin indicator={antIcon} />
        </div>
        <div className="loading-text">
          <Text className="loading-message">{message}</Text>
          <Text className="loading-description">{description}</Text>
        </div>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <Text className="progress-text">正在处理中，请稍候...</Text>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
