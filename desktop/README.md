# Ball Battle – Windows Edition

This is an offline desktop wrapper for the existing GitHub Pages game.

## Build using GitHub Actions (no local tools required)

1. Open **Actions** in the GitHub repository.
2. Choose **Ball Battle Windows Edition**.
3. Click **Run workflow** on the main branch.
4. Wait for the Windows build job to complete.
5. Open the successful run and download the **BallBattle-Windows-Setup** artifact.
6. Unzip the artifact and run **BallBattle-Setup-1.0.0.exe**.

GitHub Actions artifacts expire after 30 days by default; publish the .exe as a GitHub Release asset if you want a persistent public download.

## Offline and saved progress

Electron loads the repository's local index.html and assets. External network requests are blocked, including the Cloudflare statistics endpoint. No Cloudflare account or internet connection is required for play.

The Windows edition uses its own localStorage profile. Browser-version achievements and purchases are not automatically imported into the desktop app.

## Controls

F11 toggles fullscreen. Alt+F4 exits. Existing keyboard and game controls remain unchanged.

## Notes

The Windows installer is currently unsigned, so Windows SmartScreen may warn. The initial installer uses Electron's default icon until a Windows .ico icon is added. The GitHub Actions workflow produces an artifact, not an automatically published GitHub Release.

To build locally: install Node.js 22+, run `npm install`, then `npm run dist:win`.
