# Funded Spread - Supabase Keep Alive Script
# Hace un ping a Supabase para evitar que el proyecto se pause por inactividad

$url = "https://gboavnbalcdhwfgpzbnw.supabase.co/rest/v1/users?select=id&limit=1"
$headers = @{
    "apikey" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2F2bmJhbGNkaHdmZ3B6Ym53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMDcwMDgsImV4cCI6MjA4Nzg4MzAwOH0.imDscdLXgowBBJ-ST7EswxIHNsT88j0QsZohhbkGFw0"
}

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get -TimeoutSec 15
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] Supabase ping OK - Proyecto activo"
} catch {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$timestamp] ERROR: $($_.Exception.Message)"
}
