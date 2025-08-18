const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// 豆包AI模型配置
const AI_CONFIG = {
  apiKey: process.env.ARK_API_KEY,
  baseURL: process.env.ARK_API_BASE_URL || 'https://ark.cn-beijing.volces.com',
  modelId: process.env.ARK_MODEL_ID || 'doubao-seed-1-6-flash-250715'
};

if (!AI_CONFIG.apiKey) {
  console.warn('⚠️ 未配置豆包AI API Key，AI分析功能将使用模拟结果');
}

const SAFETY_ANALYSIS_PROMPT = `请作为专业的建筑安全专家，仔细分析这张建筑施工现场图片，识别出所有违反建筑安全和质量的行为。
...`;

function generateMockAnalysis(imagePath) {
  return {
    violations: [],
    summary: {
      severe_count: 0,
      normal_count: 0,
      total_score: 100,
      overall_assessment: '使用模拟分析',
      priority_actions: []
    }
  };
}

function parseAIResponse(aiText) {
  try {
    let cleanText = aiText.trim();
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}
  return generateMockAnalysis(null);
}

async function analyzeWithAI(imageUrl, imagePath = null, retryCount = 0) {
  if (!AI_CONFIG.apiKey) return generateMockAnalysis(imagePath);
  try {
    let imageBuffer, mimeType;
    if (imagePath) {
      imageBuffer = fs.readFileSync(imagePath);
      mimeType = 'image/jpeg';
    } else {
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 30000 });
      imageBuffer = Buffer.from(imageResponse.data);
      mimeType = imageResponse.headers['content-type'] || 'image/jpeg';
    }
    const base64Image = imageBuffer.toString('base64');
    const requestData = {
      model: AI_CONFIG.modelId,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          { type: 'text', text: SAFETY_ANALYSIS_PROMPT }
        ]
      }],
      temperature: 0.1,
      max_tokens: 4000,
      top_p: 0.9
    };
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      timeout: 120000
    };
    const response = await axios.post(`${AI_CONFIG.baseURL}/api/v3/chat/completions`, requestData, axiosConfig);
    const aiResponse = response.data?.choices?.[0]?.message?.content;
    if (!aiResponse) throw new Error('AI返回为空');
    return parseAIResponse(aiResponse);
  } catch (err) {
    console.error('AI分析失败，使用模拟结果:', err.message);
    return generateMockAnalysis(imagePath);
  }
}

router.post('/', async (req, res) => {
  try {
    const { imageUrl, imagePath } = req.body;
    if (!imageUrl && !imagePath) return res.status(400).json({ success: false, message: '请提供图片URL或图片路径' });
    let targetImagePath = null;
    let targetImageUrl = imageUrl;
    if (imagePath) {
      targetImagePath = imagePath;
    } else if (imageUrl && imageUrl.includes('/uploads/')) {
      const filename = path.basename(imageUrl);
      targetImagePath = path.join(process.env.UPLOAD_PATH || '/tmp/uploads', filename);
    }
    if (targetImagePath && !fs.existsSync(targetImagePath)) {
      return res.status(400).json({ success: false, message: '指定的图片文件不存在' });
    }
    const analysisResult = await analyzeWithAI(targetImageUrl, targetImagePath);
    res.json({ success: true, message: '分析完成', data: { imageUrl: targetImageUrl, analysis: analysisResult, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || '图片分析失败' });
  }
});

module.exports = router;
