import React, { useState, useEffect } from 'react';
import { Layout, message, BackTop } from 'antd';
import { ArrowUpOutlined } from '@ant-design/icons';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import AnalysisResult from './components/AnalysisResult';
import LoadingOverlay from './components/LoadingOverlay';
import { AnalysisData, UploadedFile } from './types';
import './App.css';

const { Content, Footer } = Layout;

const App: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisData[]>([]);

  // 初始化消息配置
  useEffect(() => {
    message.config({
      top: 100,
      duration: 3,
      maxCount: 3,
    });
  }, []);

  // 处理文件上传成功
  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file);
    setAnalysisData(null); // 清除之前的分析结果
    message.success('图片上传成功，可以开始分析了！');
  };

  // 处理分析完成
  const handleAnalysisComplete = (data: AnalysisData) => {
    setAnalysisData(data);
    setIsAnalyzing(false);
    
    // 添加到历史记录
    setAnalysisHistory(prev => [data, ...prev.slice(0, 9)]); // 保留最近10条记录
    
    const { violations } = data.analysis;
    const severeCount = violations.filter(v => v.type === '严重违规').length;
    const normalCount = violations.filter(v => v.type === '一般违规').length;
    
    if (severeCount > 0) {
      message.warning(`分析完成！发现 ${severeCount} 个严重违规和 ${normalCount} 个一般违规`);
    } else if (normalCount > 0) {
      message.info(`分析完成！发现 ${normalCount} 个一般违规`);
    } else {
      message.success('分析完成！未发现明显的安全违规行为');
    }
  };

  // 处理分析开始
  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    message.loading('正在使用AI分析图片，请稍候...', 0);
  };

  // 处理分析错误
  const handleAnalysisError = (error: string) => {
    setIsAnalyzing(false);
    message.destroy(); // 清除loading消息
    message.error(`分析失败：${error}`);
  };

  // 重新分析
  const handleReAnalyze = () => {
    if (uploadedFile) {
      setAnalysisData(null);
    }
  };

  // 清除所有数据
  const handleClear = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setIsAnalyzing(false);
    message.destroy();
    message.info('已清除所有数据');
  };

  return (
    <Layout className="app-layout">
      {/* 页面头部 */}
      <Header 
        hasData={!!(uploadedFile || analysisData)}
        onClear={handleClear}
      />
      
      {/* 主要内容区域 */}
      <Content className="app-content">
        <div className="content-container">
          {/* 上传区域 */}
          <UploadSection
            uploadedFile={uploadedFile}
            analysisData={analysisData}
            isAnalyzing={isAnalyzing}
            onFileUploaded={handleFileUploaded}
            onAnalysisStart={handleAnalysisStart}
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            onReAnalyze={handleReAnalyze}
          />
          
          {/* 分析结果区域 */}
          {analysisData && (
            <AnalysisResult
              data={analysisData}
              onReAnalyze={handleReAnalyze}
            />
          )}
        </div>
      </Content>
      
      {/* 页面底部 */}
      <Footer className="app-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>建筑安全识别平台 &copy; 2024 - 基于AI视觉识别技术的智能安全检测</p>
            <p className="footer-description">
              支持多种图片格式 • 实时AI分析 • 专业安全评估 • 详细整改建议
            </p>
          </div>
          <div className="footer-stats">
            {analysisHistory.length > 0 && (
              <span className="analysis-count">
                已完成 {analysisHistory.length} 次安全分析
              </span>
            )}
          </div>
        </div>
      </Footer>
      
      {/* 加载遮罩 */}
      <LoadingOverlay visible={isAnalyzing} />
      
      {/* 回到顶部按钮 */}
      <BackTop>
        <div className="back-top-button">
          <ArrowUpOutlined />
        </div>
      </BackTop>
    </Layout>
  );
};

export default App;
