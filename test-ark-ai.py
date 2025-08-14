#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆包AI连接测试脚本
测试建筑安全平台的AI服务连接
"""

import os
import sys
import json
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('./config.env')

def test_ark_connection():
    """测试豆包AI连接"""
    print("🔍 开始测试豆包AI连接...\n")
    
    # 检查环境变量
    print("📋 当前配置:")
    api_key = os.environ.get("ARK_API_KEY")
    base_url = os.environ.get("ARK_API_BASE_URL")
    model_id = os.environ.get("ARK_MODEL_ID")
    
    print(f"   API Key: {'✅ 已设置' if api_key else '❌ 未设置'}")
    print(f"   Base URL: {base_url or '❌ 未设置'}")
    print(f"   Model ID: {model_id or '❌ 未设置'}")
    
    if not all([api_key, base_url, model_id]):
        print("\n❌ 配置不完整，请检查config.env文件")
        return False
    
    try:
        # 设置代理
        http_proxy = os.environ.get('HTTP_PROXY')
        https_proxy = os.environ.get('HTTPS_PROXY')
        
        proxies = {}
        if http_proxy:
            proxies['http'] = http_proxy
        if https_proxy:
            proxies['https'] = https_proxy
        
        print(f"\n🌐 代理设置: {proxies if proxies else '无代理'}")
        
        # 构建请求头
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'BuildingSafetyPlatform/1.0'
        }
        
        # 构建请求数据
        data = {
            "model": model_id,
            "messages": [
                {
                    "role": "user",
                    "content": "你好，请简单介绍一下你自己。"
                }
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        # 构建API URL
        api_url = f"{base_url}/api/v3/chat/completions"
        
        print(f"\n🔌 测试API连接...")
        print(f"   API URL: {api_url}")
        
        # 发送请求
        response = requests.post(
            api_url,
            headers=headers,
            json=data,
            proxies=proxies,
            timeout=30
        )
        
        print(f"   响应状态码: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                if 'choices' in result and len(result['choices']) > 0:
                    content = result['choices'][0]['message']['content']
                    print("   ✅ AI服务连接成功！")
                    print(f"   响应内容: {content}")
                    return True
                else:
                    print("   ❌ 响应格式异常")
                    print(f"   响应内容: {result}")
                    return False
            except json.JSONDecodeError:
                print("   ❌ 响应不是有效的JSON格式")
                print(f"   响应内容: {response.text}")
                return False
        else:
            print(f"   ❌ API调用失败")
            print(f"   错误信息: {response.text}")
            return False
                
    except requests.exceptions.ProxyError as e:
        print(f"   ❌ 代理连接失败: {e}")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"   ❌ 网络连接失败: {e}")
        return False
    except requests.exceptions.Timeout as e:
        print(f"   ❌ 请求超时: {e}")
        return False
    except Exception as e:
        print(f"   ❌ AI服务连接失败: {e}")
        return False

def test_proxy_connection():
    """测试代理连接"""
    print("\n🌐 测试代理连接...")
    
    try:
        # 设置代理
        http_proxy = os.environ.get('HTTP_PROXY')
        https_proxy = os.environ.get('HTTPS_PROXY')
        
        proxies = {}
        if http_proxy:
            proxies['http'] = http_proxy
        if https_proxy:
            proxies['https'] = https_proxy
        
        print(f"   代理设置: {proxies if proxies else '无代理'}")
        
        if not proxies:
            print("   ⚠️  未设置代理，将使用直连")
            proxies = None
        
        # 测试连接
        response = requests.get(
            'https://httpbin.org/ip',
            proxies=proxies,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"   ✅ 连接成功 - IP: {response.json().get('origin')}")
            return True
        else:
            print(f"   ❌ 连接失败 - 状态码: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ 连接测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 建筑安全平台 - AI服务测试")
    print("=" * 50)
    
    # 测试代理连接
    proxy_ok = test_proxy_connection()
    
    # 测试AI连接
    ai_ok = test_ark_connection()
    
    # 总结
    print("\n" + "=" * 50)
    print("📊 测试结果总结:")
    print(f"   代理连接: {'✅ 正常' if proxy_ok else '❌ 异常'}")
    print(f"   AI服务: {'✅ 正常' if ai_ok else '❌ 异常'}")
    
    if proxy_ok and ai_ok:
        print("\n🎉 所有测试通过！您的平台可以正常使用AI服务。")
    elif proxy_ok and not ai_ok:
        print("\n⚠️  代理正常，但AI服务有问题。请检查API配置。")
    elif not proxy_ok and ai_ok:
        print("\n⚠️  AI服务正常，但代理有问题。可能影响某些功能。")
    else:
        print("\n❌ 代理和AI服务都有问题，请检查配置。")
    
    print("\n💡 建议:")
    if not proxy_ok:
        print("   - 检查Rubiz代理是否启动")
        print("   - 确认代理端口配置")
        print("   - 检查环境变量HTTP_PROXY和HTTPS_PROXY")
    if not ai_ok:
        print("   - 检查API密钥是否正确")
        print("   - 确认模型ID配置")
        print("   - 检查网络连接和防火墙设置")
        print("   - 确认豆包AI服务是否可用")

if __name__ == "__main__":
    main()
