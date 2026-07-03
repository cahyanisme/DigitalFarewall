# ==========================================================================
# NATIVE POWERSHELL WEB SERVER (NO DEPENDENCIES)
# Hosts the Digital Farewell Memory website on http://localhost:8000/
# ==========================================================================

$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host " Web Server Running on http://localhost:$port/" -ForegroundColor Green
    Write-Host " Tekan Ctrl+C di terminal ini untuk mematikan." -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "Membuka file lokal..."

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Parse path
        $rawUrl = $request.RawUrl
        $path = $rawUrl.Split('?')[0] # Remove query parameters
        
        if ($path -eq "/") {
            $file = Join-Path $PSScriptRoot "index.html"
        } else {
            # Sanitize path to prevent directory traversal
            $sanitizedPath = $path.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
            $file = Join-Path $PSScriptRoot $sanitizedPath
        }

        if (Test-Path $file -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($file)
            $response.ContentLength64 = $bytes.Length
            
            # Set content types
            $ext = [System.IO.Path]::GetExtension($file).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css; charset=utf-8" }
                ".js"   { $response.ContentType = "application/javascript; charset=utf-8" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".svg"  { $response.ContentType = "image/svg+xml" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            # CORS headers just in case
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "[200] $path" -ForegroundColor Gray
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.ContentType = "text/plain"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            Write-Host "[404] $path" -ForegroundColor Red
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    Write-Host "Server stopped." -ForegroundColor Yellow
}
