#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 使用 Python 内置的 HTTP 服务器（Mac 预装 Python）
python3 -m http.server 8080 &

# 等待服务器启动
sleep 1

# 打开浏览器
open http://localhost:8080

echo "服务器运行在 http://localhost:8080"
echo "按 Ctrl+C 可以停止服务器"

# 等待用户手动终止
wait