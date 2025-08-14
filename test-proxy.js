const axios = require('axios');
require('dotenv').config({ path: './config.env' });

// 代理配置
const proxyConfig = {
    host: process.env.RUBIZ_PROXY_HOST || '127.0.0.1',
    port: process.env.RUBIZ_PROXY_PORT || 7890,
    protocol: 'http'
};

// 测试URL - 使用更可靠的测试网站
const testUrls = [
    'https://httpbin.org/ip',
    'https://api.ipify.org?format=json',
    'https://www.baidu.com',
    'https://ark.cn-beijing.volces.com'
];

async function testProxyConnection() {
    console.log('🔍 开始测试Rubiz代理连接...\n');
    
    // 显示当前配置
    console.log('📋 当前代理配置:');
    console.log(`   代理地址: ${proxyConfig.protocol}://${proxyConfig.host}:${proxyConfig.port}`);
    console.log(`   HTTP_PROXY: ${process.env.HTTP_PROXY || '未设置'}`);
    console.log(`   HTTPS_PROXY: ${process.env.HTTPS_PROXY || '未设置'}`);
    console.log(`   NO_PROXY: ${process.env.NO_PROXY || '未设置'}\n`);
    
    // 检查Rubiz代理端口
    console.log('🔍 检查Rubiz代理端口状态...');
    const { exec } = require('child_process');
    exec('netstat -an | findstr ":7890"', (error, stdout, stderr) => {
        if (stdout) {
            console.log(`   ✅ 端口7890正在监听:\n${stdout}`);
        } else {
            console.log('   ❌ 端口7890未监听，请检查Rubiz是否启动');
        }
    });
    
    // 测试1: 直接连接（不使用代理）
    console.log('\n🧪 测试1: 直接连接（不使用代理）');
    try {
        const directResponse = await axios.get('https://httpbin.org/ip', { 
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log(`   ✅ 直接连接成功 - IP: ${directResponse.data.origin}`);
    } catch (error) {
        console.log(`   ❌ 直接连接失败: ${error.message}`);
        if (error.response) {
            console.log(`      状态码: ${error.response.status}`);
            console.log(`      响应头: ${JSON.stringify(error.response.headers)}`);
        }
    }
    
    // 测试2: 使用代理连接
    console.log('\n🧪 测试2: 使用代理连接');
    try {
        const proxyResponse = await axios.get('https://httpbin.org/ip', {
            proxy: {
                host: proxyConfig.host,
                port: proxyConfig.port,
                protocol: proxyConfig.protocol
            },
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log(`   ✅ 代理连接成功 - IP: ${proxyResponse.data.origin}`);
    } catch (error) {
        console.log(`   ❌ 代理连接失败: ${error.message}`);
        if (error.response) {
            console.log(`      状态码: ${error.response.status}`);
            console.log(`      响应头: ${JSON.stringify(error.response.headers)}`);
        }
    }
    
    // 测试3: 测试百度连接（国内网站）
    console.log('\n🧪 测试3: 测试百度连接（国内网站）');
    try {
        const baiduResponse = await axios.get('https://www.baidu.com', {
            proxy: {
                host: proxyConfig.host,
                port: proxyConfig.port,
                protocol: proxyConfig.protocol
            },
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log(`   ✅ 百度连接成功 - 状态码: ${baiduResponse.status}`);
    } catch (error) {
        console.log(`   ❌ 百度连接失败: ${error.message}`);
        if (error.response) {
            console.log(`      状态码: ${error.response.status}`);
        }
    }
    
    // 测试4: 测试AI服务连接
    console.log('\n🧪 测试4: 测试AI服务连接');
    try {
        const aiResponse = await axios.get('https://ark.cn-beijing.volces.com', {
            proxy: {
                host: proxyConfig.host,
                port: proxyConfig.port,
                protocol: proxyConfig.protocol
            },
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        console.log(`   ✅ AI服务连接成功 - 状态码: ${aiResponse.status}`);
    } catch (error) {
        console.log(`   ❌ AI服务连接失败: ${error.message}`);
        if (error.response) {
            console.log(`      状态码: ${error.response.status}`);
            if (error.response.status === 401) {
                console.log(`      💡 401错误: 需要API密钥认证，这是正常的`);
            }
        }
    }
    
    // 测试5: 环境变量测试
    console.log('\n🧪 测试5: 环境变量测试');
    if (process.env.HTTP_PROXY) {
        console.log(`   ✅ HTTP_PROXY已设置: ${process.env.HTTP_PROXY}`);
    } else {
        console.log(`   ❌ HTTP_PROXY未设置`);
    }
    
    if (process.env.HTTPS_PROXY) {
        console.log(`   ✅ HTTPS_PROXY已设置: ${process.env.HTTPS_PROXY}`);
    } else {
        console.log(`   ❌ HTTPS_PROXY未设置`);
    }
    
    if (process.env.NO_PROXY) {
        console.log(`   ✅ NO_PROXY已设置: ${process.env.NO_PROXY}`);
    } else {
        console.log(`   ❌ NO_PROXY未设置`);
    }
    
    console.log('\n🎯 测试完成！');
    console.log('\n💡 建议:');
    console.log('   1. 检查Rubiz应用是否正在运行');
    console.log('   2. 确认代理端口是否正确（默认7890）');
    console.log('   3. 尝试在Rubiz中切换代理模式（HTTP/HTTPS/SOCKS5）');
    console.log('   4. 检查Windows防火墙设置');
}

// 运行测试
testProxyConnection().catch(console.error);
