<<<<<<< HEAD
@echo off
taskkill /im firefox.exe
@echo �رջ����������Զ���ʼ���ݡ���
ping -n 3 127.1>nul
::ȡ�õ�ǰ����������·��
cd /d %~dp0
::����Ҫ����Ŀ���·��
set ProfilesPath=..\..\

::���ñ��ݴ�ŵ�·���Լ�ѹ�����ļ����������ʱ���º��գ�ע����ʹ�ö����ڣ�ͨ��ʹ�õ��ǳ�������ô����%date:~5,2%%date:~8,2%��
set ArchiveName=.\Profiles_%date:~5,2%%date:~8,2%.7z
::����Ҫ������ļ��Լ��ļ��У��������Լ����
:: abp
set opt="%ProfilesPath%adblockplus" "%ProfilesPath%adblockplus"
set opt=%opt% "%ProfilesPath%autoproxy"
:: ����ʷ
set opt=%opt% "%ProfilesPath%formhistory.sqlite"
:: userchrome
set opt=%opt% "%ProfilesPath%chrome"
:: ȫ����չ��
set opt=%opt% "%ProfilesPath%*extensions*"
:: ���
=======
﻿@echo off
taskkill /im firefox.exe
@echo 关闭火狐浏览器后自动开始备份……
ping -n 3 127.1>nul
::取得当前批处理所在路径
cd /d %~dp0
::设置要备份目标的路径
set ProfilesPath=..\..\

::设置备份存放的路径以及压缩包文件名，添加了时间月和日（注意我使用短日期，通常使用的是长日期那么就是%date:~5,2%%date:~8,2%）
set ArchiveName=.\Profiles_%date:~5,2%%date:~8,2%.7z
::设置要打包的文件以及文件夹，请酌情自己添加
:: abp
set opt="%ProfilesPath%adblockplus" "%ProfilesPath%adblockplus"
set opt=%opt% "%ProfilesPath%autoproxy"
:: 表单历史
set opt=%opt% "%ProfilesPath%formhistory.sqlite"
:: userchrome
set opt=%opt% "%ProfilesPath%chrome"
:: 全部扩展包
set opt=%opt% "%ProfilesPath%*extensions*"
:: 插件
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3
set opt=%opt% "%ProfilesPath%Plugins"
:: userScripts
set opt=%opt% "%ProfilesPath%scriptish_scripts" "%ProfilesPath%gm_scripts"
:: cookies
set opt=%opt% "%ProfilesPath%cookies.sqlite"
<<<<<<< HEAD
:: ��ʷ
set opt=%opt% "%ProfilesPath%places.sqlite"
:: localstore
set opt=%opt% "%ProfilesPath%localstore.rdf"
:: ���ò���
set opt=%opt% "%ProfilesPath%prefs.js" "%ProfilesPath%user.js"
:: stylish
set opt=%opt% "%ProfilesPath%stylish.sqlite"
:: ����
=======
:: 历史
set opt=%opt% "%ProfilesPath%places.sqlite"
:: localstore
set opt=%opt% "%ProfilesPath%localstore.rdf"
:: 配置参数
set opt=%opt% "%ProfilesPath%prefs.js" "%ProfilesPath%user.js"
:: stylish
set opt=%opt% "%ProfilesPath%stylish.sqlite"
:: 搜索
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3
set opt=%opt% "%ProfilesPath%*search*"
:: FlashGot
set opt=%opt% "%ProfilesPath%FlashGot.exe"

7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% %opt%
<<<<<<< HEAD
@echo �������
=======
@echo 备份完成
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3



