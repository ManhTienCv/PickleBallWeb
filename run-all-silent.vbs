Set WshShell = CreateObject("WScript.Shell")

' 1. Start Backend API on port 8080 silently
WshShell.Run "cmd /c cd /d """ & WshShell.CurrentDirectory & "\PickleBall"" && php artisan serve --port=8080", 0, False

' 2. Start Customer Portal SPA on port 5173 silently
WshShell.Run "cmd /c cd /d """ & WshShell.CurrentDirectory & "\demopick-client"" && npm run dev", 0, False

' 3. Start Admin Dashboard SPA on port 5174 silently
WshShell.Run "cmd /c cd /d """ & WshShell.CurrentDirectory & "\demopick-admin"" && npm run dev", 0, False

MsgBox "Da khoi chay 3 dich vu chay AN trong nen (Background):" & vbCrLf & _
       "1. Backend API: http://localhost:8080" & vbCrLf & _
       "2. Customer Portal: http://localhost:5173" & vbCrLf & _
       "3. Admin Dashboard: http://localhost:5174" & vbCrLf & vbCrLf & _
       "De tat cac dich vu, nhap chuot vao file stop-all.bat", 64, "DemoPick Web System"
