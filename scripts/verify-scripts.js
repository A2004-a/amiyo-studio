const { execSync } = require('child_process');
const fs = require('fs');

const psFiles = ['install.ps1', 'version.ps1', 'bin/amiyo.ps1'];
let hasError = false;

for (const file of psFiles) {
  if (fs.existsSync(file)) {
    try {
      const output = execSync(`powershell.exe -NoProfile -Command "$e = $null; [System.Management.Automation.Language.Parser]::ParseFile('${file}', [ref]$null, [ref]$e); if ($e.Count -eq 0) { 'SUCCESS' } else { $e | Format-List; exit 1 }"`, { encoding: 'utf8' });
      if (output.includes('SUCCESS')) {
        console.log(`✓ [PASS] ${file} AST syntax check`);
      } else {
        console.error(`✗ [FAIL] ${file}:`, output);
        hasError = true;
      }
    } catch (err) {
      console.error(`✗ [FAIL] ${file} Parser error:`, err.message);
      hasError = true;
    }
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('All PowerShell scripts verified clean with 0 syntax errors.');
  process.exit(0);
}


