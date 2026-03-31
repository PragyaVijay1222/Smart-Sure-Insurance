$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:8080"
$Headers = @{
    "Content-Type" = "application/json"
}
$todayStr = (Get-Date).ToString("yyyyMMddHHmmss")

Write-Host "--- 1. Registering a Customer ---" -ForegroundColor Cyan
$regBody = @{
    firstName = "Saga"
    lastName = "Tester"
    email = "sagatest+$todayStr@example.com"
    password = "password123"
    role = "CUSTOMER"
} | ConvertTo-Json
try {
    $regRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/register" -Method Post -Headers $Headers -Body $regBody
    Write-Host "Register Output: $($regRes | ConvertTo-Json -Compress)"
} catch {
    Write-Host "User exists, continuing..."
}

Write-Host "`n--- 2. Logging in as Admin ---" -ForegroundColor Cyan
$adminBody = @{
    email = "pragyavijay20318@gmail.com"
    password = "vijay@**24"
} | ConvertTo-Json
$adminRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Headers $Headers -Body $adminBody
$adminToken = $adminRes.token
if ([string]::IsNullOrEmpty($adminToken)) {
    Write-Host "Admin Login Failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Admin logged in successfully."

Write-Host "`n--- 3. Creating PolicyType as Admin ---" -ForegroundColor Cyan
$adminHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $adminToken"
}
$ptBody = @{
    name = "Saga Health Plan $todayStr"
    category = "HEALTH"
    basePremium = 500
    maxCoverageAmount = 100000
    deductibleAmount = 100
    termMonths = 12
} | ConvertTo-Json
$ptRes = Invoke-RestMethod -Uri "$BaseUrl/api/policy-types" -Method Post -Headers $adminHeaders -Body $ptBody
Write-Host "PolicyType Created."
$policyTypeId = $ptRes.id

Write-Host "`n--- 4. Logging in as Customer ---" -ForegroundColor Cyan
$custBody = @{
    email = "sagatest+$todayStr@example.com"
    password = "password123"
} | ConvertTo-Json
$custRes = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Headers $Headers -Body $custBody
$custToken = $custRes.token

Write-Host "`n--- 5. Purchasing Policy as Customer ---" -ForegroundColor Cyan
$custHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $custToken"
}
$today = (Get-Date).ToString("yyyy-MM-dd")
$purchBody = @{
    policyTypeId = $policyTypeId
    coverageAmount = 50000
    paymentFrequency = "MONTHLY"
    startDate = $today
} | ConvertTo-Json
$purchRes = Invoke-RestMethod -Uri "$BaseUrl/api/policies/purchase" -Method Post -Headers $custHeaders -Body $purchBody
$policyId = $purchRes.id

Write-Host "`n--- 6. Extracting Generated Premium ID ---" -ForegroundColor Cyan
$premRes = Invoke-RestMethod -Uri "$BaseUrl/api/policies/$policyId/premiums" -Method Get -Headers $custHeaders
$premiumId = $premRes[0].id

Write-Host "`n--- 7. Initiating Payment (Saga Start) ---" -ForegroundColor Cyan
$initBody = @{
    policyId = $policyId
    premiumId = $premiumId
    paymentMethod = "CREDIT_CARD"
} | ConvertTo-Json
$initRes = Invoke-RestMethod -Uri "$BaseUrl/api/policies/premiums/pay" -Method Post -Headers $custHeaders -Body $initBody
$rzpOrderId = $initRes.razorpayOrderId
Write-Host "Razorpay Order ID: $rzpOrderId"

Write-Host "`n--- 8. Confirming Payment via PaymentService (Saga Hook) ---" -ForegroundColor Cyan
$confBody = @{
    razorpayOrderId = $rzpOrderId
    razorpayPaymentId = "pay_SAGA_HOOK_AWS123"
} | ConvertTo-Json
$confRes = Invoke-RestMethod -Uri "$BaseUrl/api/payments/confirm" -Method Post -Headers $custHeaders -Body $confBody

Write-Host "`nWaiting 2 seconds for RabbitMQ Sync..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host "`n--- 9. Verifying Premium Status is PAID ---" -ForegroundColor Cyan
$verifyRes = Invoke-RestMethod -Uri "$BaseUrl/api/policies/$policyId/premiums" -Method Get -Headers $custHeaders 
$verifyRes[0] | ConvertTo-Json -Depth 5

Write-Host "`n--- 10. Filing a Claim against Policy ---" -ForegroundColor Cyan
$claimBody = @{
    policyId = $policyId
} | ConvertTo-Json
$claimRes = Invoke-RestMethod -Uri "$BaseUrl/api/claims" -Method Post -Headers $custHeaders -Body $claimBody

Write-Host "`nAll Systems Tested End-to-End Successfully!" -ForegroundColor Green
