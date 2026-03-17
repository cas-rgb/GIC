param(
    [int]$Hours = 6,
    [int]$DelayMinutes = 20
)

$ErrorActionPreference = "Continue"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
$dataDir = Join-Path $root "data\\enrichment"
$timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss"
$logPath = Join-Path $logDir "overnight-enrichment-$timestamp.log"
$reportPath = Join-Path $dataDir "overnight-enrichment-report-$timestamp.json"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null

function Write-Log {
    param([string]$Message)
    $line = "$(Get-Date -Format o) $Message"
    Add-Content -Path $logPath -Value $line
    Write-Output $line
}

function Run-Step {
    param(
        [string]$Name,
        [string]$Command
    )

    Write-Log "[start] $Name :: $Command"
    & C:\WINDOWS\System32\WindowsPowerShell\v1.0\powershell.exe -Command $Command 2>&1 | ForEach-Object {
        $line = [string]$_
        Add-Content -Path $logPath -Value "$(Get-Date -Format o) [$Name] $line"
        Write-Host $line
    }
    $exitCode = $LASTEXITCODE
    Write-Log "[finish] $Name :: exit=$exitCode"

    return ,([PSCustomObject]@{
        name = $Name
        command = $Command
        exitCode = $exitCode
        finishedAt = (Get-Date).ToString("o")
    })
}

$steps = @(
    @{ name = "firestore-community-signals"; command = "npm.cmd run import:firestore:community-signals:v2" },
    @{ name = "official-ingestion"; command = "npm.cmd run ingest:official:v2" },
    @{ name = "registry-rss"; command = "npm.cmd run ingest:rss:v2" },
    @{ name = "news-ingestion"; command = "npm.cmd run ingest:news:v2" },
    @{ name = "citizen-voice"; command = "npm.cmd run ingest:citizen-voice:v2" },
    @{ name = "process-queue"; command = "npm.cmd run process:v2:queue" },
    @{ name = "municipal-money"; command = "npm.cmd run ingest:municipal-money:v2" },
    @{ name = "normalize-projects"; command = "npm.cmd run normalize:projects:v2" },
    @{ name = "rebuild-projects"; command = "npm.cmd run rebuild:projects:v2" },
    @{ name = "rebuild-citizen-voice"; command = "npm.cmd run rebuild:citizen-voice:v2" },
    @{ name = "rebuild-leadership"; command = "npm.cmd run rebuild:leadership:v2" },
    @{ name = "rebuild-municipal-leadership"; command = "npm.cmd run rebuild:municipal-leadership:v2" },
    @{ name = "collect-context"; command = "npm.cmd run collect:context:v2" }
)

$startedAt = Get-Date
$deadline = $startedAt.AddHours($Hours)
$cycles = @()
$cycleNumber = 1

Write-Log "Overnight enrichment started. Deadline: $($deadline.ToString('o'))"

while ((Get-Date) -lt $deadline) {
    $cycleStart = Get-Date
    Write-Log "=== cycle $cycleNumber start ==="
    $results = @()

    foreach ($step in $steps) {
        if ((Get-Date) -ge $deadline) {
            Write-Log "Deadline reached before step $($step.name)."
            break
        }

        $results += Run-Step -Name $step.name -Command $step.command
    }

    $cycleEnd = Get-Date
    $cycles += [PSCustomObject]@{
        cycleNumber = $cycleNumber
        startedAt = $cycleStart.ToString("o")
        finishedAt = $cycleEnd.ToString("o")
        results = $results
    }

    $report = [PSCustomObject]@{
        startedAt = $startedAt.ToString("o")
        finishedAt = $null
        deadline = $deadline.ToString("o")
        hours = $Hours
        delayMinutes = $DelayMinutes
        logPath = $logPath
        cycles = $cycles
    }
    $report | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath

    Write-Log "=== cycle $cycleNumber end ==="
    $cycleNumber += 1

    if ((Get-Date) -ge $deadline) {
        break
    }

    Start-Sleep -Seconds ($DelayMinutes * 60)
}

$finalReport = [PSCustomObject]@{
    startedAt = $startedAt.ToString("o")
    finishedAt = (Get-Date).ToString("o")
    deadline = $deadline.ToString("o")
    hours = $Hours
    delayMinutes = $DelayMinutes
    logPath = $logPath
    cycles = $cycles
}
$finalReport | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath

Write-Log "Overnight enrichment complete. Report: $reportPath"
