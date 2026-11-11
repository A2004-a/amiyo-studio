const { execSync } = require('child_process');
const fs = require('fs');

const psFiles = ['install.ps1', 'version.ps1', 'bin/amiyo.ps1'];

for (const file of psFiles) {
  if (fs.existsSync(file)) {
    try {
      const output = execSync(`powershell.exe -NoProfile -Command "$e = $null; [System.Management.Automation.Language.Parser]::ParseFile('${file}', [ref]$null, [ref]$e); if ($e.Count -eq 0) { 'SUCCESS' } else { $e | Format-List }"`, { encoding: 'utf8' });
      console.log(`[${file}]:`, output.trim());
    } catch (err) {
      console.error(`[${file}] Error:`, err.message);
    }
  }
}
