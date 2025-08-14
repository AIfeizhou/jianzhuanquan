import React from 'react';
import { Layout, Button, Typography, Space, Tooltip } from 'antd';
import { 
  SafetyOutlined, 
  ClearOutlined,
  InfoCircleOutlined,
  GithubOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { HeaderProps } from '../types';
import './Header.css';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header: React.FC<HeaderProps> = ({ hasData, onClear }) => {
  return (
    <AntHeader className="app-header">
      <div className="header-container">
        {/* 左侧品牌区域 */}
        <div className="header-brand">
          <div className="brand-icon">
            <SafetyOutlined />
          </div>
          <div className="brand-info">
            <Title level={3} className="brand-title">
              建筑安全识别平台
            </Title>
            <Text className="brand-subtitle">
              AI驱动的智能安全检测
            </Text>
          </div>
        </div>

        {/* 中间功能介绍 */}
        <div className="header-features">
          <Space size="large">
            <div className="feature-item">
              <BulbOutlined className="feature-icon" />
              <span>智能识别</span>
            </div>
            <div className="feature-item">
              <SafetyOutlined className="feature-icon" />
              <span>安全评估</span>
            </div>
            <div className="feature-item">
              <InfoCircleOutlined className="feature-icon" />
              <span>整改建议</span>
            </div>
          </Space>
        </div>

        {/* 右侧操作区域 */}
        <div className="header-actions">
          <Space>
            {/* 帮助按钮 */}
            <Tooltip title="查看使用说明">
              <Button 
                type="text" 
                icon={<InfoCircleOutlined />}
                className="header-button"
                onClick={() => {
                  // TODO: 显示帮助文档
                  console.log('显示帮助文档');
                }}
              >
                帮助
              </Button>
            </Tooltip>

            {/* GitHub链接 */}
            <Tooltip title="访问项目源码">
              <Button 
                type="text" 
                icon={<GithubOutlined />}
                className="header-button"
                onClick={() => {
                  window.open('https://github.com', '_blank');
                }}
              >
                源码
              </Button>
            </Tooltip>

            {/* 清除数据按钮 */}
            {hasData && (
              <Tooltip title="清除所有上传的图片和分析结果">
                <Button 
                  type="primary" 
                  danger
                  icon={<ClearOutlined />}
                  className="clear-button"
                  onClick={onClear}
                >
                  清除数据
                </Button>
              </Tooltip>
            )}
          </Space>
        </div>
      </div>

      {/* 底部描述信息 */}
      <div className="header-description">
        <Text className="description-text">
          上传建筑施工现场图片，AI将自动识别安全违规行为并提供专业整改建议
        </Text>
        <div className="description-stats">
          <Space split={<span className="stats-divider">•</span>}>
            <span>支持 JPG、PNG、BMP、WebP 格式</span>
            <span>最大 20MB 文件大小</span>
            <span>实时 AI 分析</span>
            <span>专业安全评估</span>
          </Space>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
