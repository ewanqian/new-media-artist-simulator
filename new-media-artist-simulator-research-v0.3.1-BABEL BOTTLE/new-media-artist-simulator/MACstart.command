#!/bin/bash

# 新媒体艺术家模拟器 - Mac自动启动脚本
# 巴别瓶展览特别版 By 钱誉文

echo "🎨 新媒体艺术家模拟器启动中..."
echo "=========================================="

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 工作目录: $SCRIPT_DIR"

# 检查必要文件是否存在
if [ ! -f "index.html" ]; then
    echo "❌ 未找到 index.html，请确认脚本位置正确！"
    read -p "按回车键退出..."
    exit 1
fi

# 检查Node.js是否可用
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version 2>/dev/null)
        if [ $? -eq 0 ]; then
            echo "✅ 找到 Node.js: $NODE_VERSION"
            return 0
        fi
    fi
    return 1
}

# 检查Python3是否已安装
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
        echo "✅ 找到 Python3: $(python3 --version)"
        return 0
    elif command -v python &> /dev/null; then
        # 检查python是否是3.x版本
        PYTHON_VERSION=$(python -c 'import sys; print(sys.version_info.major)' 2>/dev/null)
        if [ "$PYTHON_VERSION" = "3" ]; then
            PYTHON_CMD="python"
            echo "✅ 找到 Python3: $(python --version)"
            return 0
        else
            echo "⚠️  系统中的python是Python2，需要Python3"
            return 1
        fi
    fi
    return 1
}

# 尝试安装Python3
install_python() {
    echo "❌ 未找到Python，正在尝试安装..."
    
    # 检查是否有Homebrew
    if command -v brew &> /dev/null; then
        echo "📦 使用Homebrew安装Python3..."
        if brew install python3; then
            PYTHON_CMD="python3"
            echo "✅ Python3 安装成功"
            return 0
        else
            echo "❌ Python3 安装失败"
            return 1
        fi
    else
        echo "⚠️  未找到Homebrew，请手动安装Python3"
        echo "安装选项："
        echo "1. 访问 https://www.python.org/downloads/ 下载官方安装包"
        echo "2. 或先安装Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        echo "3. 然后运行: brew install python3"
        return 1
    fi
}

# 检查端口8080是否被占用
check_port() {
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  端口8080已被占用"
        echo "尝试释放端口..."
        
        # 杀死占用端口的进程
        lsof -ti:8080 | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # 再次检查
        if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "❌ 无法释放端口8080，请手动检查占用进程"
            echo "可以运行: lsof -i :8080"
            return 1
        else
            echo "✅ 端口8080已释放"
        fi
    fi
    return 0
}

# 使用Node.js启动服务器
start_nodejs_server() {
    echo "🚀 使用Node.js启动服务器 (端口8080)..."
    
    # 检查是否有项目自带的服务器脚本
    if [ -f "server-node.js" ]; then
        echo "📝 使用项目自带的Node.js服务器..."
        node server-node.js &
        SERVER_PID=$!
    else
        echo "📝 使用简单HTTP服务器..."
        # 如果有npx，使用http-server
        if command -v npx &> /dev/null; then
            npx http-server -p 8080 --cors &
            SERVER_PID=$!
        else
            echo "❌ 未找到npx，无法启动Node.js服务器"
            return 1
        fi
    fi
    
    echo "📊 服务器进程ID: $SERVER_PID"
    return 0
}

# 使用Python启动服务器
start_python_server() {
    echo "🚀 使用Python启动HTTP服务器 (端口8080)..."
    
    # 在后台启动服务器
    $PYTHON_CMD -m http.server 8080 > server.log 2>&1 &
    SERVER_PID=$!
    
    echo "📊 服务器进程ID: $SERVER_PID"
    return 0
}

# 检查服务器状态并打开浏览器
check_server_and_open_browser() {
    # 等待服务器启动
    echo "⏳ 等待服务器启动..."
    sleep 3
    
    # 检查服务器是否正常运行
    if ps -p $SERVER_PID > /dev/null 2>&1; then
        echo "✅ 服务器启动成功！"
        
        # 尝试打开浏览器
        echo "🌐 正在打开浏览器..."
        sleep 1
        
        if command -v open &> /dev/null; then
            open http://localhost:8080
        else
            echo "⚠️  无法自动打开浏览器，请手动访问: http://localhost:8080"
        fi
        
        echo ""
        echo "🎮 游戏已启动！"
        echo "=========================================="
        echo "📍 访问地址: http://localhost:8080"
        echo "📄 服务器日志: server.log"
        echo "⚠️  重要提示："
        echo "   • 请勿关闭此终端窗口"
        echo "   • 关闭此窗口将停止游戏服务器"
        echo "   • 按 Ctrl+C 可停止服务器"
        echo "=========================================="
        echo ""
        
        # 等待用户输入或Ctrl+C
        trap 'kill_server' INT
        echo "按 Ctrl+C 停止服务器，或直接关闭此窗口..."
        wait $SERVER_PID
        
    else
        echo "❌ 服务器启动失败"
        if [ -f "server.log" ]; then
            echo "错误日志内容:"
            cat server.log
        fi
        return 1
    fi
}

# 停止服务器函数
kill_server() {
    echo ""
    echo "🛑 正在停止服务器..."
    
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
        sleep 2
        
        # 强制杀死如果还在运行
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            kill -9 $SERVER_PID 2>/dev/null || true
        fi
    fi
    
    # 清理端口
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    
    echo "✅ 服务器已停止"
    echo "👋 感谢使用新媒体艺术家模拟器！"
    exit 0
}

# 主流程
main() {
    # 检查并释放端口
    if ! check_port; then
        read -p "按回车键退出..."
        exit 1
    fi
    
    # 优先尝试使用Node.js
    if check_nodejs; then
        if start_nodejs_server; then
            check_server_and_open_browser
            return $?
        else
            echo "⚠️  Node.js服务器启动失败，尝试Python服务器..."
        fi
    fi
    
    # 尝试使用Python
    if check_python || install_python; then
        if start_python_server; then
            check_server_and_open_browser
            return $?
        else
            echo "❌ Python服务器启动失败"
            read -p "按回车键退出..."
            exit 1
        fi
    else
        echo "❌ 无法找到或安装Python3"
        echo "请手动安装Python3后重试"
        read -p "按回车键退出..."
        exit 1
    fi
}

# 运行主流程
main