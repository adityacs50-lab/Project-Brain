@echo off
echo ==========================================
echo       COMPANY BRAIN - DEMO RESET
echo ==========================================
echo.
echo Waiting 3 seconds for servers to stabilize...
powershell -Command "Start-Sleep -s 3"

echo [1/2] Seeding operational rules...
powershell -Command "try { Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/rules/test-workspace-1/seed' | Out-Null; echo 'Rules seeded successfully.' } catch { echo 'Failed to seed rules. Is the backend running at :8000?' }"

echo [2/2] Seeding agent decisions...
powershell -Command "try { Invoke-RestMethod -Method Post -Uri 'http://localhost:8000/agent/seed/test-workspace-1' | Out-Null; echo 'Decisions seeded successfully.' } catch { echo 'Failed to seed decisions.' }"

echo.
echo Launching Dashboard at http://localhost:3000...
start http://localhost:3000

echo.
echo Reset Complete. Check the browser.
timeout /t 5
