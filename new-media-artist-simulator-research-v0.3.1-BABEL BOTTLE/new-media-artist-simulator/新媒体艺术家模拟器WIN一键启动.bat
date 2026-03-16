@echo off
chcp 65001 >nul
title 新媒体艺术家模拟器 - 一键启动
setlocal enabledelayedexpansion

:: 进入项目目录
cd /d "%~dp0new-media-artist-simulator"

:: 检查 index.html 是否存在
if not exist "index.html" (
    echo ❌ 未找到 index.html，请确认脚本位置正确！
    pause
    exit /b 1
)

:: 检查 Python
python --version >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=python"
    goto :run_python
)
python3 --version >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=python3"
    goto :run_python
)

:: 检查 Node.js
node --version >nul 2>&1
if %errorlevel%==0 (
    goto :run_node
)

:: 自动下载安装 Python
echo.
echo ⚠️ 未检测到 Python 或 Node.js，正在下载安装 Python...
set "PYVER=3.11.7"
set "PYURL=https://www.python.org/ftp/python/%PYVER%/python-%PYVER%-amd64.exe"
set "PYEXE=%temp%\python-installer.exe"
powershell -Command "try { (New-Object Net.WebClient).DownloadFile('%PYURL%', '%PYEXE%'); Write-Host '✅ Python安装包已下载' } catch { Write-Host '❌ 下载失败'; exit 1 }"
if not exist "%PYEXE%" (
    echo ❌ Python 安装包下载失败，请手动安装 Python。
    pause
    exit /b 1
)
start /wait "" "%PYEXE%" /quiet InstallAllUsers=1 PrependPath=1 AssociateFiles=1
del "%PYEXE%"
echo ✅ Python 安装完成，正在继续...

:: 让新装的 Python 生效
set "PATH=%PATH%;C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\;C:\Program Files\Python311\"
python --version >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=python"
    goto :run_python
)
python3 --version >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON_CMD=python3"
    goto :run_python
)
echo ❌ Python 安装失败，请重启电脑或手动安装 Python。
pause
exit /b 1

:run_python
echo 🚀 启动 Python 本地服务器...
start "" http://localhost:8080
%PYTHON_CMD% -m http.server 8080
exit /b 0

:run_node
echo 🚀 启动 Node.js 本地服务器...
start "" http://localhost:8080
npx http-server -p 8080
exit /b 0