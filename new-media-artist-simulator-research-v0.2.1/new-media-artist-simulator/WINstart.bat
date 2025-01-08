@echo off
chcp 65001 > nul
title 新媒体艺术家模拟器
color 0A

:: 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    echo 请求管理员权限...
    powershell -Command "Start-Process -FilePath '%0' -Verb RunAs"
    exit
)

:admin
:: 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo Python未安装，准备自动下载安装...
    echo.
    
    :: 创建临时目录
    mkdir "%temp%\pythonInstall" 2>nul
    cd /d "%temp%\pythonInstall"
    
    :: 下载Python安装程序
    echo 正在下载Python安装程序...
    powershell -Command "(New-Object Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.11.5/python-3.11.5-amd64.exe', 'python-installer.exe')"
    
    :: 安装Python
    echo 正在安装Python...
    start /wait python-installer.exe /quiet InstallAllUsers=1 PrependPath=1
    
    :: 清理临时文件
    cd /d "%~dp0"
    rmdir /s /q "%temp%\pythonInstall"
    
    echo Python安装完成！
    echo.
)

:: 检查安装是否成功
python --version >nul 2>&1
if errorlevel 1 (
    echo Python安装似乎出现问题。
    echo 请访问 https://www.python.org/downloads/ 手动安装Python
    pause
    exit
)

:: 启动服务器
echo 正在启动服务器...
start "" python -m http.server 8080

:: 等待服务器启动
timeout /t 2 /nobreak > nul

:: 打开浏览器
start http://localhost:8080

echo.
echo ================================
echo    新媒体艺术家模拟器已启动
echo ================================
echo.
echo 提示：
echo 1. 请勿关闭此窗口
echo 2. 如果页面显示空白请刷新
echo 3. 关闭此窗口将停止游戏运行
echo.
echo 按任意键退出...
pause > nul
taskkill /F /IM python.exe /T
exit