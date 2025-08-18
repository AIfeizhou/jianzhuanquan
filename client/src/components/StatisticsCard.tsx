import React from 'react';
import { Row, Col, Card, Progress, Statistic, Typography, Space } from 'antd';
import { 
  SafetyOutlined, 
  ExclamationCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { StatisticsCardProps } from '../types';
import './StatisticsCard.css';

const { Title, Text } = Typography;

const StatisticsCard: React.FC<StatisticsCardProps> = ({ summary, totalViolations }) => {
  const { severe_count, normal_count, total_score, overall_assessment } = summary;

  // 计算安全等级
  const getSafetyLevel = (score: number) => {
    if (score >= 90) return { level: '优秀', color: '#52c41a', icon: TrophyOutlined };
    if (score >= 80) return { level: '良好', color: '#1890ff', icon: CheckCircleOutlined };
    if (score >= 60) return { level: '合格', color: '#faad14', icon: WarningOutlined };
    return { level: '不合格', color: '#ff4d4f', icon: ExclamationCircleOutlined };
  };

  const safetyInfo = getSafetyLevel(total_score);
  const SafetyIcon = safetyInfo.icon;

  // 计算进度条颜色
  const getProgressColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div className="statistics-card">
      <Row gutter={[24, 24]}>
        {/* 总体安全评分 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card score-card" variant="borderless">
            <div className="stat-content">
              <div className="stat-icon score-icon">
                <SafetyOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-number-large">{total_score}</div>
                <div className="stat-label">安全评分</div>
                <div className="stat-sublabel">满分100分</div>
              </div>
            </div>
            <Progress
              percent={total_score}
              showInfo={false}
              strokeColor={getProgressColor(total_score)}
              strokeWidth={8}
              className="score-progress"
            />
          </Card>
        </Col>

        {/* 安全等级 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card level-card" variant="borderless">
            <div className="stat-content">
              <div className="stat-icon level-icon" style={{ color: safetyInfo.color }}>
                <SafetyIcon />
              </div>
              <div className="stat-info">
                <div className="stat-number" style={{ color: safetyInfo.color }}>
                  {safetyInfo.level}
                </div>
                <div className="stat-label">安全等级</div>
                <div className="stat-sublabel">基于综合评估</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 严重违规 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card severe-card" variant="borderless">
            <div className="stat-content">
              <div className="stat-icon severe-icon">
                <ExclamationCircleOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-number severe-number">{severe_count}</div>
                <div className="stat-label">严重违规</div>
                <div className="stat-sublabel">需立即整改</div>
              </div>
            </div>
            {severe_count > 0 && (
              <div className="stat-warning">
                <WarningOutlined /> 高风险项目
              </div>
            )}
          </Card>
        </Col>

        {/* 一般违规 */}
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card normal-card" variant="borderless">
            <div className="stat-content">
              <div className="stat-icon normal-icon">
                <WarningOutlined />
              </div>
              <div className="stat-info">
                <div className="stat-number normal-number">{normal_count}</div>
                <div className="stat-label">一般违规</div>
                <div className="stat-sublabel">建议整改</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 详细统计 */}
      <Row gutter={[24, 24]} className="detailed-stats">
        <Col xs={24}>
          <Card className="assessment-card" variant="borderless">
            <div className="assessment-header">
              <Title level={4} className="assessment-title">
                <SafetyOutlined /> 综合评估报告
              </Title>
            </div>
            
            <div className="assessment-content">
              <div className="assessment-text">
                <Text className="assessment-description">
                  {overall_assessment}
                </Text>
              </div>

              <div className="statistics-grid">
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="总违规数量"
                      value={totalViolations}
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: totalViolations > 0 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="严重违规占比"
                      value={totalViolations > 0 ? ((severe_count / totalViolations) * 100).toFixed(1) : 0}
                      suffix="%"
                      prefix={<ExclamationCircleOutlined />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="一般违规占比"
                      value={totalViolations > 0 ? ((normal_count / totalViolations) * 100).toFixed(1) : 0}
                      suffix="%"
                      prefix={<WarningOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="合规率"
                      value={total_score}
                      suffix="%"
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: getProgressColor(total_score) }}
                    />
                  </Col>
                </Row>
              </div>

              {/* 安全建议 */}
              {(severe_count > 0 || normal_count > 0) && (
                <div className="safety-recommendations">
                  <Title level={5} className="recommendations-title">
                    <WarningOutlined /> 安全建议
                  </Title>
                  <div className="recommendations-content">
                    <Space direction="vertical" size="small" className="recommendations-list">
                      {severe_count > 0 && (
                        <Text className="recommendation-item severe">
                          • 立即停止相关作业，优先处理 {severe_count} 个严重安全违规
                        </Text>
                      )}
                      {normal_count > 0 && (
                        <Text className="recommendation-item normal">
                          • 制定整改计划，逐步解决 {normal_count} 个一般安全违规
                        </Text>
                      )}
                      <Text className="recommendation-item general">
                        • 加强安全培训，提高施工人员安全意识
                      </Text>
                      <Text className="recommendation-item general">
                        • 定期进行安全检查，建立长效安全管理机制
                      </Text>
                    </Space>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatisticsCard;
