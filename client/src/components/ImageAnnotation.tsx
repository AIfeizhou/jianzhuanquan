import React, { useRef, useEffect, useState } from 'react';
import './ImageAnnotation.css';

interface Violation {
  type: string;
  category: string;
  description: string;
  coordinates: number[];
  regulations: Array<{
    code: string;
    article: string;
    content: string;
  }>;
  suggestions: string[];
  severity: string;
  risk_level: string;
}

interface ImageAnnotationProps {
  imageUrl: string;
  violations: Violation[];
  imageInfo?: any;
  config?: any;
  onViolationClick?: (violation: Violation) => void;
}

const ImageAnnotation: React.FC<ImageAnnotationProps> = ({
  imageUrl,
  violations,
  imageInfo,
  config = {},
  onViolationClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [localConfig, setLocalConfig] = useState({
    showLabels: true,
    lineWidth: 3,
    fontSize: 14,
    fontFamily: 'Arial, sans-serif',
    severeColor: '#ff4d4f',
    normalColor: '#722ed1',
    labelBackground: '#ffffff',
    labelTextColor: '#333333'
  });

  // 默认配置
  const defaultConfig = {
    ...localConfig,
    ...config
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制图片
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // 计算缩放比例
    const scaleX = canvas.width / image.naturalWidth;
    const scaleY = canvas.height / image.naturalHeight;

    console.log('🔍 坐标转换信息:', {
      canvasSize: { width: canvas.width, height: canvas.height },
      imageSize: { width: image.naturalWidth, height: image.naturalHeight },
      scale: { x: scaleX, y: scaleY }
    });

    // 绘制违规标注 - 使用引线标注系统
    violations.forEach((violation, index) => {
      // 验证坐标格式
      if (!Array.isArray(violation.coordinates) || violation.coordinates.length !== 4) {
        console.warn(`⚠️ 违规项 ${index + 1} 坐标格式错误:`, violation.coordinates);
        return;
      }

      // 确保坐标是数字
      const coords = violation.coordinates.map((coord: any) => {
        const num = typeof coord === 'string' ? parseFloat(coord) : Number(coord);
        if (isNaN(num)) {
          console.warn(`⚠️ 坐标值不是数字: ${coord}`);
          return 0;
        }
        return num;
      });

      // 转换坐标
      const scaledX1 = coords[0] * scaleX;
      const scaledY1 = coords[1] * scaleY;
      const scaledX2 = coords[2] * scaleX;
      const scaledY2 = coords[3] * scaleY;

      console.log(`📍 违规项 ${index + 1} 坐标转换:`, {
        original: coords,
        scaled: [scaledX1, scaledY1, scaledX2, scaledY2],
        type: violation.type,
        description: violation.description
      });

      // 设置颜色
      const color = violation.type === '严重违规' 
        ? defaultConfig.severeColor 
        : defaultConfig.normalColor;

      // 计算标注框的中心点
      const centerX = (scaledX1 + scaledX2) / 2;
      const centerY = (scaledY1 + scaledY2) / 2;

      // 绘制违规区域的小标记点（不遮挡图片内容）
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 计算引线终点位置（避免重叠）
      const labelOffset = 80; // 标签距离图片的距离
      const labelSpacing = 50; // 标签之间的垂直间距
      
      let labelX, labelY;
      
      // 根据违规位置智能调整标签位置
      if (centerX < canvas.width / 2) {
        // 左侧违规，标签放在右侧
        labelX = Math.min(canvas.width + labelOffset, centerX + labelOffset);
      } else {
        // 右侧违规，标签放在左侧
        labelX = Math.max(-labelOffset, centerX - labelOffset);
      }
      
      // 垂直位置，避免重叠
      labelY = 40 + index * labelSpacing;

      // 绘制引线
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]); // 虚线引线
      
      // 引线路径：从违规点到标签
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      
      // 如果标签在右侧
      if (labelX > canvas.width) {
        ctx.lineTo(canvas.width - 10, centerY);
        ctx.lineTo(canvas.width - 10, labelY);
        ctx.lineTo(labelX - 10, labelY);
      } 
      // 如果标签在左侧
      else if (labelX < 0) {
        ctx.lineTo(10, centerY);
        ctx.lineTo(10, labelY);
        ctx.lineTo(labelX + 10, labelY);
      }
      // 如果标签在图片内部
      else {
        ctx.lineTo(labelX, labelY);
      }
      
      ctx.stroke();

      // 绘制标签背景
      const label = `${index + 1}`;
      
      ctx.font = `bold ${defaultConfig.fontSize + 4}px ${defaultConfig.fontFamily}`;
      const textMetrics = ctx.measureText(label);
      const textWidth = textMetrics.width;
      const textHeight = defaultConfig.fontSize + 4;
      
      const padding = 6;
      const bgX = labelX - textWidth / 2;
      const bgY = labelY - textHeight / 2;
      const bgWidth = textWidth + padding * 2;
      const bgHeight = textHeight + padding * 2;

      // 绘制标签背景和边框
      ctx.setLineDash([]); // 实线
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);

      // 绘制标签文本（只显示数字）
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);

      // 绘制编号圆圈（在引线起点）
      const circleRadius = 12;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 绘制编号
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${defaultConfig.fontSize - 2}px ${defaultConfig.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), centerX, centerY);
    });
  };

  // 处理图片加载
  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const handleImageLoad = () => {
      setIsLoading(false);
      setError(null);

      // 设置画布尺寸
      const containerWidth = 600; // 最大宽度
      const containerHeight = 400; // 最大高度
      
      let canvasWidth = image.naturalWidth;
      let canvasHeight = image.naturalHeight;
      
      // 如果图片太大，按比例缩放
      if (canvasWidth > containerWidth || canvasHeight > containerHeight) {
        const ratio = Math.min(containerWidth / canvasWidth, containerHeight / canvasHeight);
        canvasWidth = canvasWidth * ratio;
        canvasHeight = canvasHeight * ratio;
      }
      
      setCanvasSize({ width: canvasWidth, height: canvasHeight });
      
      // 延迟绘制标注，确保画布尺寸已更新
      setTimeout(() => {
        drawAnnotations();
      }, 100);
    };

    const handleImageError = () => {
      setIsLoading(false);
      setError('图片加载失败');
    };

    image.addEventListener('load', handleImageLoad);
    image.addEventListener('error', handleImageError);

    return () => {
      image.removeEventListener('load', handleImageLoad);
      image.removeEventListener('error', handleImageError);
    };
  }, [imageUrl]);

  // 当违规数据变化时重新绘制
  useEffect(() => {
    if (!isLoading && violations.length > 0) {
      drawAnnotations();
    }
  }, [violations, isLoading]);

  // 处理画布点击
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onViolationClick || violations.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 检查点击是否在某个违规框内
    violations.forEach((violation, index) => {
      if (!Array.isArray(violation.coordinates) || violation.coordinates.length !== 4) return;

      const coords = violation.coordinates.map((coord: any) => {
        const num = typeof coord === 'string' ? parseFloat(coord) : Number(coord);
        return isNaN(num) ? 0 : num;
      });

      const scaleX = canvas.width / (imageRef.current?.naturalWidth || 1);
      const scaleY = canvas.height / (imageRef.current?.naturalHeight || 1);
      
      const scaledX1 = coords[0] * scaleX;
      const scaledY1 = coords[1] * scaleY;
      const scaledX2 = coords[2] * scaleX;
      const scaledY2 = coords[3] * scaleY;

      if (x >= scaledX1 && x <= scaledX2 && y >= scaledY1 && y <= scaledY2) {
        onViolationClick(violation);
      }
    });
  };

  return (
    <div className="image-annotation">
      <div className="annotation-header">
        <h3>违规标注图</h3>
        <div className="annotation-controls">
          <button 
            onClick={() => setLocalConfig(prev => ({ ...prev, showLabels: !prev.showLabels }))}
            className="control-btn"
          >
            {localConfig.showLabels ? '隐藏标签' : '显示标签'}
          </button>
          <button 
            onClick={() => {
              console.log('🔍 当前违规数据:', violations);
              console.log('🔍 当前配置:', localConfig);
              drawAnnotations();
            }}
            className="control-btn test-btn"
          >
            测试标注
          </button>
        </div>
      </div>
      
      <div className="annotation-container">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="annotation-canvas"
          onClick={handleCanvasClick}
        />
        
        <img
          ref={imageRef}
          src={imageUrl}
          alt="施工现场"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
        />
        
        {isLoading && (
          <div className="annotation-loading">
            <div className="loading-spinner"></div>
            <p>正在加载图片...</p>
          </div>
        )}
        {error && (
          <div className="error-message">
            <span>❌ {error}</span>
          </div>
        )}
      </div>
      
      {violations.length > 0 && (
        <div className="violation-summary">
          <h4>违规统计</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="label">严重违规:</span>
              <span className="value severe">{violations.filter(v => v.type === '严重违规').length}</span>
            </div>
            <div className="summary-item">
              <span className="label">一般违规:</span>
              <span className="value normal">{violations.filter(v => v.type === '一般违规').length}</span>
            </div>
            <div className="summary-item">
              <span className="label">总计:</span>
              <span className="value total">{violations.length}</span>
            </div>
          </div>
          <div className="violation-list">
            <h5>违规详情：</h5>
            {violations.map((violation, index) => (
              <div key={index} className="violation-item">
                <span className="violation-number">{index + 1}</span>
                <span className="violation-type">{violation.type}</span>
                <span className="violation-desc">{violation.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnnotation;
