#!/bin/bash

# Vercel构建脚本
echo "开始构建前端应用..."

# 进入前端目录
cd client

# 安装依赖
echo "安装前端依赖..."
npm install --legacy-peer-deps

# 构建应用
echo "构建前端应用..."
npm run build

echo "前端构建完成！"
