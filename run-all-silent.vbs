Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory

' 1. Start Backend API (Port 8080) - WindowStyle 0 = Completely Hidden, NO Taskbar icon
WshShell.Run "cmd /c cd /d """ & strPath & "\PickleBall"" && php artisan serve --port=8080", 0, False

' 2. Start Customer Portal SPA (Port 5173) - WindowStyle 0 = Completely Hidden, NO Taskbar icon
WshShell.Run "cmd /c cd /d """ & strPath & "\demopick-client"" && npm run dev", 0, False

' 3. Start Admin Dashboard SPA (Port 5174) - WindowStyle 0 = Completely Hidden, NO Taskbar icon
WshShell.Run "cmd /c cd /d """ & strPath & "\demopick-admin"" && npm run dev", 0, False
