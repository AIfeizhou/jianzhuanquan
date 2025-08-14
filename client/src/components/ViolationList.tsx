import React from 'react';
import { List, Tag, Button, Space, Typography, Tooltip } from 'antd';
import { 
  ExclamationCircleOutlined, 
  WarningOutlined,
  EyeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ViolationListProps } from '../types';
import './ViolationList.css';

const { Text, Paragraph } = Typography;

const ViolationList: React.FC<ViolationListProps> = ({
  violations,
  onViolationClick,
  selectedViolation
}) => {
  if (violations.length === 0) {
    return (
      <div className="no-violations">
        <div className="no-violations-content">
          <ExclamationCircleOutlined className="no-violations-icon" />
          <Text className="no-violations-text">未发现安全违规行为</Text>
          <Text className="no-violations-desc">恭喜！该施工现场图片符合安全规范</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="violation-list">
      <div className="list-header">
        <Text strong className="list-title">
          发现 {violations.length} 个违规行为
        </Text>
        <Text className="list-subtitle">
          点击查看详情或在图片上定位
        </Text>
      </div>

      <List
        className="violations"
        dataSource={violations}
        renderItem={(violation, index) => (
          <List.Item
            key={index}
            className={`violation-item ${violation.type === '严重违规' ? 'severe' : 'normal'} ${
              selectedViolation === index ? 'selected' : ''
            }`}
            onClick={() => onViolationClick?.(violation, index)}
          >
            <div className="violation-content">
              {/* 违规头部 */}
              <div className="violation-header">
                <div className="violation-meta">
                  <span className="violation-number">#{index + 1}</span>
                  <Tag 
                    color={violation.type === '严重违规' ? 'error' : 'purple'}
                    icon={violation.type === '严重违规' ? <ExclamationCircleOutlined /> : <WarningOutlined />}
                    className="violation-tag"
                  >
                    {violation.type}
                  </Tag>
                  <Tag color="blue" className="risk-tag">
                    {violation.risk_level}
                  </Tag>
                </div>
                
                {onViolationClick && (
                  <Tooltip title="在图片上定位">
                    <Button 
                      type="text" 
                      size="small"
                      icon={<EyeOutlined />}
                      className="locate-button"
                    />
                  </Tooltip>
                )}
              </div>

              {/* 违规类别 */}
              <div className="violation-category">
                <Text strong>{violation.category}</Text>
              </div>

              {/* 违规描述 */}
              <div className="violation-description">
                <Paragraph className="description-text">
                  {violation.description}
                </Paragraph>
              </div>

              {/* 相关条例 */}
              {violation.regulations && violation.regulations.length > 0 && (
                <div className="violation-regulations">
                  <Text className="section-title">
                    <InfoCircleOutlined /> 相关条例
                  </Text>
                  <div className="regulations-list">
                    {violation.regulations.map((reg, regIndex) => (
                      <div key={regIndex} className="regulation-item">
                        <Tag color="geekblue">
                          {reg.code} {reg.article}
                        </Tag>
                        <Text className="regulation-content">{reg.content}</Text>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 整改建议 */}
              {violation.suggestions && violation.suggestions.length > 0 && (
                <div className="violation-suggestions">
                  <Text className="section-title">
                    <ExclamationCircleOutlined /> 整改建议
                  </Text>
                  <ul className="suggestions-list">
                    {violation.suggestions.map((suggestion, sugIndex) => (
                      <li key={sugIndex} className="suggestion-item">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 底部信息 */}
              <div className="violation-footer">
                <Space size="small" className="footer-info">
                  <Text className="coordinate-info">
                    坐标: [{violation.coordinates.join(', ')}]
                  </Text>
                  <Text className="severity-info">
                    严重程度: {violation.severity === 'high' ? '高' : violation.severity === 'medium' ? '中' : '低'}
                  </Text>
                </Space>
              </div>
            </div>
          </List.Item>
        )}
      />

      {/* 底部统计 */}
      <div className="list-footer">
        <div className="violation-stats">
          <div className="stat-item severe">
            <span className="stat-number">
              {violations.filter(v => v.type === '严重违规').length}
            </span>
            <span className="stat-label">严重违规</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item normal">
            <span className="stat-number">
              {violations.filter(v => v.type === '一般违规').length}
            </span>
            <span className="stat-label">一般违规</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationList;
