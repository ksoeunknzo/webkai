# UTF-8 panel index builder — preserves all Japanese copy from backup
$ErrorActionPreference = 'Stop'
$hp = $PSScriptRoot
$enc = New-Object System.Text.UTF8Encoding $false
$b = [IO.File]::ReadAllText((Join-Path $hp '_backup\2026-05-15-0143\index.html'), $enc)

function Rx([string]$p) {
  $m = [regex]::Match($b, $p, 'Singleline')
  if (-not $m.Success) { throw "No match: $p" }
  return $m.Groups[1].Value
}

$catchcopy   = Rx '(?s)<span class="catchcopy-inner">(.*?)</span>'
$heroSummary = Rx '(?s)<div class="hero-summary business-text">(.*?)</motion>'
$heroSummary = Rx '(?s)<div class="hero-summary business-text">(.*?)</div>'
$svcLead     = Rx '(?s)<p class="section-lead business-text">(.*?)</p>'
$contactLead = ([regex]::Matches($b, '(?s)<p class="section-lead business-text">(.*?)</p>'))[1].Groups[1].Value
$svc1        = Rx '(?s)<article class="service-item reveal">\s*<span class="service-watermark[^>]*>01</span>(.*?)</article>'
$svc2        = Rx '(?s)<article class="service-item reveal">\s*<span class="service-watermark[^>]*>02</span>(.*?)</article>'
$svc3        = Rx '(?s)<article class="service-item reveal">\s*<span class="service-watermark[^>]*>03</span>(.*?)</article>'
$contactDl   = Rx '(?s)<dl class="contact-list reveal">(.*?)</dl>'
$footerInner = Rx '(?s)<footer class="site-footer">\s*<div class="container footer-inner">(.*?)</div>\s*</footer>'

function SvcPanel([string]$num, [string]$idx, [string]$inner, [string]$aria) {
  $title = ([regex]::Match($inner, '(?s)<h3[^>]*>(.*?)</h3>')).Groups[1].Value
  $copy = ([regex]::Match($inner, '(?s)<motion>\s*<div class="service-item-copy[^>]*>(.*?)</div>')).Groups[1].Value
  if (-not $copy) {
    $copy = ([regex]::Match($inner, '(?s)<motion>\s*<div class="service-item-copy[^>]*>(.*?)</div>')).Groups[1].Value
  }
  $copy = ([regex]::Match($inner, '(?s)<div class="service-item-copy[^>]*>(.*?)</div>')).Groups[1].Value
  return @"
    <section class="panel panel--service panel--service-$num" data-panel-index="$idx" aria-label="$aria">
      <div class="panel__glow" aria-hidden="true"></div>
      <motion>
      <span class="giant-number" aria-hidden="true">$num</span>
      <div class="panel__inner">
        <div class="glass-panel">
          <div class="panel__layout">
            <p class="panel__index-label ui-label reveal-item" data-delay="0">$num</p>
            <h2 class="panel__title">
              <span class="mask-title"><span>$title</span></span>
            </h2>
            <div class="panel__body business-text reveal-item" data-delay="320">
              $copy
            </div>
          </div>
        </div>
      </div>
    </section>
"@
}

$svc1Title = ([regex]::Match($svc1, '(?s)<h3[^>]*>(.*?)</h3>')).Groups[1].Value
$svc2Title = ([regex]::Match($svc2, '(?s)<h3[^>]*>(.*?)</h3>')).Groups[1].Value
$svc3Title = ([regex]::Match($svc3, '(?s)<h3[^>]*>(.*?)</h3>')).Groups[1].Value

$html = @'
PLACEHOLDER
'@

# Build via string concat to avoid tag corruption
$head = @'
<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
'@

Write-Host "Use node script instead"
exit 1
