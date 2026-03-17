$ErrorActionPreference = "Continue"

$workspace = "C:\Users\Dell\Desktop\Sparc Innovation\gic-app"
$logDir = Join-Path $workspace "logs"
$logPath = Join-Path $logDir "collect-v2-30min.log"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

$cycles = 6
$sleepSeconds = 300

function Write-Log($message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp $message" | Tee-Object -FilePath $logPath -Append
}

function Run-Step($label, $command) {
    Write-Log "START $label"
    try {
        Invoke-Expression $command 2>&1 | Tee-Object -FilePath $logPath -Append
        Write-Log "END $label"
    } catch {
        Write-Log "ERROR $label :: $($_.Exception.Message)"
    }
}

Set-Location $workspace
Write-Log "BEGIN collect-v2-30min"

for ($cycle = 1; $cycle -le $cycles; $cycle += 1) {
    Write-Log "CYCLE $cycle of $cycles"
    Run-Step "ingest:rss:v2" "npm.cmd run ingest:rss:v2"
    Run-Step "ingest:official:v2" "npm.cmd run ingest:official:v2"
    Run-Step "ingest:cogta:v2" "npm.cmd run ingest:cogta:v2"
    Run-Step "ingest:dws:v2" "npm.cmd run ingest:dws:v2"
    Run-Step "process:v2:queue" "npm.cmd run process:v2:queue"
    Run-Step "reprocess:v2:live" "npm.cmd run reprocess:v2:live"
    Run-Step "rebuild:sentiment:v2" "npm.cmd run rebuild:sentiment:v2"
    Run-Step "rebuild:leadership:v2" "npm.cmd run rebuild:leadership:v2"
    Run-Step "rebuild:municipal-leadership:v2" "npm.cmd run rebuild:municipal-leadership:v2"
    Run-Step "rebuild:citizen-voice:v2" "npm.cmd run rebuild:citizen-voice:v2"

    if ($cycle -lt $cycles) {
        Write-Log "SLEEP ${sleepSeconds}s"
        Start-Sleep -Seconds $sleepSeconds
    }
}

Write-Log "END collect-v2-30min"
