import React, { useState } from 'react';
import { Card, Row, Col, Button, Space, Divider, Tabs, message, Dropdown } from 'antd';
import { 
  DownloadOutlined, 
  ReloadOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  FilePdfOutlined,
  FileWordOutlined
} from '@ant-design/icons';
import { AnalysisResultProps } from '../types';
import ImageAnnotation from './ImageAnnotation';
import ViolationList from './ViolationList';
import StatisticsCard from './StatisticsCard';
import './AnalysisResult.css';

const { TabPane } = Tabs;

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, onReAnalyze }) => {
  const [selectedViolation, setSelectedViolation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const { analysis, imageUrl, timestamp } = data;
  const { violations, summary } = analysis;

  // 处理违规项点击
  const handleViolationClick = (violation: any) => {
    // 找到违规项在数组中的索引
    const index = violations.findIndex(v => v === violation);
    setSelectedViolation(selectedViolation === index ? null : index);
  };

  // 下载报告
  const handleDownloadReport = async (format: 'pdf' | 'word') => {
    try {
      message.loading(`正在生成${format === 'pdf' ? 'PDF' : 'Word'}报告...`, 0);
      
      // 调用后端API生成报告
      const response = await fetch('/api/analyze/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData: analysis,
          format: format
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // 获取文件blob
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `建筑安全分析报告_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL
      window.URL.revokeObjectURL(url);
      
      message.destroy();
      message.success(`${format === 'pdf' ? 'PDF' : 'Word'}报告下载成功！`);
      
    } catch (error: any) {
      message.destroy();
      message.error(`${format === 'pdf' ? 'PDF' : 'Word'}报告下载失败：` + (error?.message || '未知错误'));
      console.error('下载报告失败:', error);
    }
  };

  // 获取标注后的图片
  const getAnnotatedImage = async (): Promise<string> => {
    return new Promise((resolve) => {
      // 等待一小段时间确保标注已绘制完成
      setTimeout(() => {
        const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
        if (canvas) {
          // 将画布转换为base64图片
          const imageData = canvas.toDataURL('image/png', 0.9);
          resolve(imageData);
        } else {
          // 如果没有找到画布，返回原图
          resolve(imageUrl);
        }
      }, 500);
    });
  };

  // 生成报告内容
  const generateReportContent = (annotatedImage: string) => {
    const reportDate = new Date().toLocaleString('zh-CN');
    const violationsHtml = violations.map((violation, index) => `
      <div class="violation-item ${violation.type === '严重违规' ? 'severe' : 'normal'}">
        <h4>${index + 1}. ${violation.type} - ${violation.category}</h4>
        <p><strong>描述：</strong>${violation.description}</p>
        <p><strong>风险等级：</strong>${violation.risk_level}</p>
        <p><strong>相关条例：</strong></p>
        <ul>
          ${violation.regulations.map(reg => `
            <li>${reg.code} 第${reg.article}条：${reg.content}</li>
          `).join('')}
        </ul>
        <p><strong>整改建议：</strong></p>
        <ul>
          ${violation.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
        </ul>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>建筑安全分析报告</title>
    <style>
        body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #1890ff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #1890ff; margin: 0; font-size: 28px; }
        .header .subtitle { color: #666; margin: 10px 0; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 15px; }
        .summary-item { text-align: center; padding: 15px; background: white; border-radius: 6px; border: 1px solid #e8e8e8; }
        .summary-item .number { font-size: 24px; font-weight: bold; color: #1890ff; }
        .summary-item .label { color: #666; margin-top: 5px; }
        .annotated-image { margin-bottom: 30px; }
        .image-container { text-align: center; margin: 20px 0; }
        .image-caption { text-align: center; color: #666; font-style: italic; margin-top: 10px; }
        .violations { margin-bottom: 30px; }
        .violation-item { margin-bottom: 25px; padding: 20px; border-radius: 6px; border-left: 4px solid; }
        .violation-item.severe { border-left-color: #ff4d4f; background: #fff2f0; }
        .violation-item.normal { border-left-color: #722ed1; background: #f9f0ff; }
        .violation-item h4 { margin: 0 0 15px 0; color: #333; }
        .violation-item p { margin: 10px 0; line-height: 1.6; }
        .violation-item ul { margin: 10px 0; padding-left: 20px; }
        .violation-item li { margin: 5px 0; line-height: 1.6; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e8e8; color: #666; }
        @media print { body { background: white; } .report-container { box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="header">
            <h1>🏗️ 建筑安全分析报告</h1>
            <div class="subtitle">AI驱动的智能安全检测系统</div>
            <div class="subtitle">生成时间：${reportDate}</div>
        </div>
        
        <div class="summary">
            <h3>📊 分析概览</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="number">${summary.total_score}</div>
                    <div class="label">安全评分</div>
                </div>
                <div class="summary-item">
                    <div class="number">${summary.severe_count}</div>
                    <div class="label">严重违规</div>
                </div>
                <div class="summary-item">
                    <div class="number">${summary.normal_count}</div>
                    <div class="label">一般违规</div>
                </div>
                <div class="summary-item">
                    <div class="number">${violations.length}</div>
                    <div class="label">总违规数</div>
                </div>
            </div>
            <p><strong>整体评估：</strong>${summary.overall_assessment}</p>
            ${summary.priority_actions.length > 0 ? `<p><strong>优先整改事项：</strong>${summary.priority_actions.join('、')}</p>` : ''}
        </div>
        
        <div class="annotated-image">
            <h3>📸 违规标注图</h3>
            <div class="image-container">
                <img src="${annotatedImage}" alt="建筑安全违规标注图" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
            <p class="image-caption">注：图中标注点表示违规位置，引线指向详细说明</p>
        </div>
        
        <div class="violations">
            <h3>🚨 违规详情</h3>
            ${violationsHtml}
        </div>
        
        <div class="footer">
            <p>本报告由建筑安全识别平台AI系统自动生成</p>
            <p>⚠️ 免责声明：本报告仅供参考，不能替代专业的安全检查</p>
        </div>
    </div>
</body>
</html>`;
  };

  // 打印报告
  const handlePrintReport = () => {
    window.print();
  };

  // 分享结果
  const handleShareResult = () => {
    // TODO: 实现分享功能
    message.success('分享功能开发中');
  };

  return (
    <div className="analysis-result">
      <Card className="result-card" variant="borderless">
        {/* 结果头部 */}
        <div className="result-header">
          <div className="header-info">
            <h2 className="result-title">
              <SafetyOutlined className="title-icon" />
              安全分析报告
            </h2>
            <p className="result-time">
              分析时间: {new Date(timestamp).toLocaleString()}
            </p>
          </div>
          
          <div className="header-actions">
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={onReAnalyze}
                className="action-button"
              >
                重新分析
              </Button>
              <Button 
                icon={<PrinterOutlined />}
                onClick={handlePrintReport}
                className="action-button no-print"
              >
                打印报告
              </Button>
              <Button 
                icon={<ShareAltOutlined />}
                onClick={handleShareResult}
                className="action-button no-print"
              >
                分享结果
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'pdf',
                      icon: <FilePdfOutlined />,
                      label: '下载PDF报告',
                      onClick: () => handleDownloadReport('pdf')
                    },
                    {
                      key: 'word',
                      icon: <FileWordOutlined />,
                      label: '下载Word报告',
                      onClick: () => handleDownloadReport('word')
                    }
                  ]
                }}
                placement="bottomRight"
              >
                <Button 
                  type="primary"
                  icon={<DownloadOutlined />}
                  className="download-button no-print"
                >
                  下载报告
                </Button>
              </Dropdown>
            </Space>
          </div>
        </div>

        <Divider />

        {/* 统计概览 */}
        <StatisticsCard 
          summary={summary}
          totalViolations={violations.length}
        />

        <Divider />

        {/* 主要内容 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="result-tabs"
        >
          {/* 概览标签页 */}
          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                分析概览
              </span>
            } 
            key="overview"
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                {/* 图片标注 */}
                <Card 
                  title="违规标注图"
                  className="annotation-card"
                  variant="borderless"
                >
                  <ImageAnnotation
                    imageUrl={imageUrl}
                    violations={violations}
                    onViolationClick={handleViolationClick}
                  />
                </Card>
              </Col>
              
              <Col xs={24} lg={12}>
                {/* 违规列表 */}
                <Card 
                  title="违规详情"
                  className="violation-card"
                  variant="borderless"
                >
                  <ViolationList
                    violations={violations}
                    onViolationClick={handleViolationClick}
                    selectedViolation={selectedViolation}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 详细报告标签页 */}
          <TabPane 
            tab={
              <span>
                <SafetyOutlined />
                详细报告
              </span>
            } 
            key="details"
          >
            <div className="detailed-report">
              {/* 整体评估 */}
              <Card 
                title="整体安全评估"
                className="assessment-card"
                variant="borderless"
              >
                <div className="assessment-content">
                  <div className="assessment-score">
                    <span className="score-label">安全评分</span>
                    <span className={`score-value ${summary.total_score >= 80 ? 'good' : summary.total_score >= 60 ? 'warning' : 'danger'}`}>
                      {summary.total_score}
                    </span>
                    <span className="score-unit">分</span>
                  </div>
                  
                  <div className="assessment-text">
                    <p>{summary.overall_assessment}</p>
                  </div>
                  
                  {summary.priority_actions.length > 0 && (
                    <div className="priority-actions">
                      <h4>优先整改事项：</h4>
                      <ul>
                        {summary.priority_actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* 违规详情 */}
              <Card 
                title="违规行为详情"
                className="violations-detail-card"
                variant="borderless"
              >
                {violations.length === 0 ? (
                  <div className="no-violations">
                    <SafetyOutlined className="no-violations-icon" />
                    <p>恭喜！未发现明显的安全违规行为</p>
                  </div>
                ) : (
                  <div className="violations-detail">
                    {violations.map((violation, index) => (
                      <div key={index} className={`violation-item ${violation.type === '严重违规' ? 'severe' : 'normal'}`}>
                        <div className="violation-header">
                          <span className="violation-type">{violation.type}</span>
                          <span className="violation-category">{violation.category}</span>
                        </div>
                        
                        <div className="violation-content">
                          <div className="violation-description">
                            <h4>违规描述：</h4>
                            <p>{violation.description}</p>
                          </div>
                          
                          <div className="violation-regulations">
                            <h4>相关条例：</h4>
                            {violation.regulations.map((reg, regIndex) => (
                              <div key={regIndex} className="regulation-item">
                                <strong>{reg.code} {reg.article}:</strong> {reg.content}
                              </div>
                            ))}
                          </div>
                          
                          <div className="violation-suggestions">
                            <h4>整改建议：</h4>
                            <ul>
                              {violation.suggestions.map((suggestion, sugIndex) => (
                                <li key={sugIndex}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="violation-meta">
                            <span className="risk-level">风险等级: {violation.risk_level}</span>
                            <span className="coordinates">
                              坐标: [{violation.coordinates.join(', ')}]
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AnalysisResult;
