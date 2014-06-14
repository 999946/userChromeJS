<<<<<<< HEAD
@echo off
taskkill /im firefox.exe
@echo ¹Ø±Õ»ðºüä¯ÀÀÆ÷ºó×Ô¶¯¿ªÊ¼±¸·Ý¡­¡­
ping -n 3 127.1>nul
::È¡µÃµ±Ç°Åú´¦ÀíËùÔÚÂ·¾¶
cd /d %~dp0
::ÉèÖÃÒª±¸·ÝÄ¿±êµÄÂ·¾¶
set ProfilesPath=..\..\

::ÉèÖÃ±¸·Ý´æ·ÅµÄÂ·¾¶ÒÔ¼°Ñ¹Ëõ°üÎÄ¼þÃû£¬Ìí¼ÓÁËÊ±¼äÔÂºÍÈÕ£¨×¢ÒâÎÒÊ¹ÓÃ¶ÌÈÕÆÚ£¬Í¨³£Ê¹ÓÃµÄÊÇ³¤ÈÕÆÚÄÇÃ´¾ÍÊÇ%date:~5,2%%date:~8,2%£©
set ArchiveName=.\Profiles_%date:~5,2%%date:~8,2%.7z
::ÉèÖÃÒª´ò°üµÄÎÄ¼þÒÔ¼°ÎÄ¼þ¼Ð£¬Çë×ÃÇé×Ô¼ºÌí¼Ó
:: abp
set opt="%ProfilesPath%adblockplus" "%ProfilesPath%adblockplus"
set opt=%opt% "%ProfilesPath%autoproxy"
:: ±íµ¥ÀúÊ·
set opt=%opt% "%ProfilesPath%formhistory.sqlite"
:: userchrome
set opt=%opt% "%ProfilesPath%chrome"
:: È«²¿À©Õ¹°ü
set opt=%opt% "%ProfilesPath%*extensions*"
:: ²å¼þ
=======
ï»¿@echo off
taskkill /im firefox.exe
@echo å…³é—­ç«ç‹æµè§ˆå™¨åŽè‡ªåŠ¨å¼€å§‹å¤‡ä»½â€¦â€¦
ping -n 3 127.1>nul
::å–å¾—å½“å‰æ‰¹å¤„ç†æ‰€åœ¨è·¯å¾„
cd /d %~dp0
::è®¾ç½®è¦å¤‡ä»½ç›®æ ‡çš„è·¯å¾„
set ProfilesPath=..\..\

::è®¾ç½®å¤‡ä»½å­˜æ”¾çš„è·¯å¾„ä»¥åŠåŽ‹ç¼©åŒ…æ–‡ä»¶åï¼Œæ·»åŠ äº†æ—¶é—´æœˆå’Œæ—¥ï¼ˆæ³¨æ„æˆ‘ä½¿ç”¨çŸ­æ—¥æœŸï¼Œé€šå¸¸ä½¿ç”¨çš„æ˜¯é•¿æ—¥æœŸé‚£ä¹ˆå°±æ˜¯%date:~5,2%%date:~8,2%ï¼‰
set ArchiveName=.\Profiles_%date:~5,2%%date:~8,2%.7z
::è®¾ç½®è¦æ‰“åŒ…çš„æ–‡ä»¶ä»¥åŠæ–‡ä»¶å¤¹ï¼Œè¯·é…Œæƒ…è‡ªå·±æ·»åŠ 
:: abp
set opt="%ProfilesPath%adblockplus" "%ProfilesPath%adblockplus"
set opt=%opt% "%ProfilesPath%autoproxy"
:: è¡¨å•åŽ†å²
set opt=%opt% "%ProfilesPath%formhistory.sqlite"
:: userchrome
set opt=%opt% "%ProfilesPath%chrome"
:: å…¨éƒ¨æ‰©å±•åŒ…
set opt=%opt% "%ProfilesPath%*extensions*"
:: æ’ä»¶
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3
set opt=%opt% "%ProfilesPath%Plugins"
:: userScripts
set opt=%opt% "%ProfilesPath%scriptish_scripts" "%ProfilesPath%gm_scripts"
:: cookies
set opt=%opt% "%ProfilesPath%cookies.sqlite"
<<<<<<< HEAD
:: ÀúÊ·
set opt=%opt% "%ProfilesPath%places.sqlite"
:: localstore
set opt=%opt% "%ProfilesPath%localstore.rdf"
:: ÅäÖÃ²ÎÊý
set opt=%opt% "%ProfilesPath%prefs.js" "%ProfilesPath%user.js"
:: stylish
set opt=%opt% "%ProfilesPath%stylish.sqlite"
:: ËÑË÷
=======
:: åŽ†å²
set opt=%opt% "%ProfilesPath%places.sqlite"
:: localstore
set opt=%opt% "%ProfilesPath%localstore.rdf"
:: é…ç½®å‚æ•°
set opt=%opt% "%ProfilesPath%prefs.js" "%ProfilesPath%user.js"
:: stylish
set opt=%opt% "%ProfilesPath%stylish.sqlite"
:: æœç´¢
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3
set opt=%opt% "%ProfilesPath%*search*"
:: FlashGot
set opt=%opt% "%ProfilesPath%FlashGot.exe"

7z.exe u -up1q3r2x2y2z2w2 %ArchiveName% %opt%
<<<<<<< HEAD
@echo ±¸·ÝÍê³É
=======
@echo å¤‡ä»½å®Œæˆ
>>>>>>> 6b27c670b159a266533b99deea80a223e683b7e3



