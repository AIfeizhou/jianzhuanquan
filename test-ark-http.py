#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
豆包AI HTTP API测试脚本
直接使用HTTP请求测试AI服务
"""

import os
import json
import requests
from dotenv import load_dotenv

# 加载环境变量
load_dotenv('./config.env')

def test_ark_http_api():
    """使用HTTP API测试豆包AI服务"""
    print("🔍 开始测试豆包AI HTTP API...\n")
    
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
        proxies = {
            'http': os.environ.get('HTTP_PROXY'),
            'https': os.environ.get('HTTPS_PROXY')
        }
        
        print(f"\n🌐 代理设置: {proxies}")
        
        # 构建请求URL
        api_url = f"{base_url}/api/v3/chat/completions"
        print(f"   API URL: {api_url}")
        
        # 构建请求头
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
            'X-Is-Encrypted': 'true'
        }
        
        # 构建请求体
        payload = {
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
        
        print(f"\n📤 发送请求...")
        print(f"   请求体: {json.dumps(payload, ensure_ascii=False, indent=2)}")
        
        # 发送请求
        response = requests.post(
            api_url,
            headers=headers,
            json=payload,
            proxies=proxies,
            timeout=30
        )
        
        print(f"\n📥 收到响应:")
        print(f"   状态码: {response.status_code}")
        print(f"   响应头: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   ✅ AI服务调用成功！")
                if 'choices' in result and len(result['choices']) > 0:
                    content = result['choices'][0].get('message', {}).get('content', '')
                    print(f"   响应内容: {content}")
                else:
                    print(f"   响应内容: {result}")
                return True
            except json.JSONDecodeError:
                print(f"   ⚠️  响应不是有效的JSON: {response.text}")
                return False
        else:
            print(f"   ❌ AI服务调用失败")
            print(f"   错误信息: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ 请求异常: {e}")
        return False
    except Exception as e:
        print(f"   ❌ 其他错误: {e}")
        return False

def test_proxy_connection():
    """测试代理连接"""
    print("\n🌐 测试代理连接...")
    
    try:
        # 设置代理
        proxies = {
            'http': os.environ.get('HTTP_PROXY'),
            'https': os.environ.get('HTTPS_PROXY')
        }
        
        print(f"   代理设置: {proxies}")
        
        # 测试连接
        response = requests.get(
            'https://httpbin.org/ip',
            proxies=proxies,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"   ✅ 代理连接成功 - IP: {response.json().get('origin')}")
            return True
        else:
            print(f"   ❌ 代理连接失败 - 状态码: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ 代理测试失败: {e}")
        return False

def main():
    """主函数"""
    print("🚀 建筑安全平台 - AI服务HTTP API测试")
    print("=" * 60)
    
    # 测试代理连接
    proxy_ok = test_proxy_connection()
    
    # 测试AI HTTP API
    ai_ok = test_ark_http_api()
    
    # 总结
    print("\n" + "=" * 60)
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
    if not ai_ok:
        print("   - 检查API密钥是否正确")
        print("   - 确认模型ID配置")
        print("   - 检查豆包AI服务是否可用")

if __name__ == "__main__":
    main()
