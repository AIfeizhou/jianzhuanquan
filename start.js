#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查环境配置
function checkEnvironment() {
    console.log('🔧 检查环境配置...');
    
    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
        console.error('❌ Node.js 版本过低，需要 18.0.0 或更高版本');
        console.error(`   当前版本: ${nodeVersion}`);
        process.exit(1);
    }
    
    console.log(`✅ Node.js 版本: ${nodeVersion}`);
    
    // 检查环境变量文件
    const envFiles = ['config.env', 'env.example'];
    let envFound = false;
    
    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`✅ 找到环境配置文件: ${envFile}`);
            envFound = true;
            break;
        }
    }
    
    if (!envFound) {
        console.warn('⚠️  未找到环境配置文件，请创建 config.env 文件');
    }
    
    // 检查上传目录
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`✅ 创建上传目录: ${uploadDir}`);
    } else {
        console.log(`✅ 上传目录已存在: ${uploadDir}`);
    }
    
    // 检查依赖
    const packageJsonPath = './package.json';
    const clientPackageJsonPath = './client/package.json';
    
    if (!fs.existsSync('node_modules')) {
        console.warn('⚠️  后端依赖未安装，请运行: npm install');
    } else {
        console.log('✅ 后端依赖已安装');
    }
    
    if (!fs.existsSync('./client/node_modules')) {
        console.warn('⚠️  前端依赖未安装，请运行: cd client && npm install --legacy-peer-deps');
    } else {
        console.log('✅ 前端依赖已安装');
    }
}

// 启动后端服务
function startBackend() {
    console.log('\n🚀 启动后端服务...');
    
    const backend = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: {
            ...process.env,
            PORT: '3000'
        }
    });
    
    backend.on('error', (error) => {
        console.error('❌ 后端服务启动失败:', error.message);
    });
    
    return backend;
}

// 启动前端服务
function startFrontend() {
    console.log('\n🚀 启动前端服务...');
    
    const frontend = spawn('npm', ['start'], {
        cwd: './client',
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            PORT: '3001',
            BROWSER: 'none' // 不自动打开浏览器
        }
    });
    
    frontend.on('error', (error) => {
        console.error('❌ 前端服务启动失败:', error.message);
    });
    
    return frontend;
}

// 显示启动信息
function showStartupInfo() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 建筑安全识别平台启动成功！');
    console.log('='.repeat(60));
    console.log('📱 前端应用: http://localhost:3001');
    console.log('⚙️  后端API:  http://localhost:3000');
    console.log('📚 API文档:  http://localhost:3000/health');
    console.log('='.repeat(60));
    console.log('💡 使用说明:');
    console.log('   1. 在浏览器中打开前端地址');
    console.log('   2. 上传建筑施工现场图片');
    console.log('   3. 等待AI分析结果');
    console.log('   4. 查看违规标注和整改建议');
    console.log('='.repeat(60));
    console.log('⏹️  按 Ctrl+C 停止服务\n');
}

// 主启动函数
async function main() {
    console.log('🏗️  建筑安全识别平台启动器');
    console.log('='.repeat(40));
    
    // 检查环境
    checkEnvironment();
    
    console.log('\n🚀 正在启动服务...');
    
    try {
        // 启动后端
        const backend = startBackend();
        
        // 等待后端启动
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 启动前端
        const frontend = startFrontend();
        
        // 等待前端启动
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // 显示启动信息
        showStartupInfo();
        
        // 处理退出信号
        process.on('SIGINT', () => {
            console.log('\n\n⏹️  正在停止服务...');
            backend.kill();
            frontend.kill();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            console.log('\n\n⏹️  正在停止服务...');
            backend.kill();
            frontend.kill();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ 启动失败:', error.message);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 启动器出错:', error);
        process.exit(1);
    });
}

module.exports = { main, checkEnvironment };
