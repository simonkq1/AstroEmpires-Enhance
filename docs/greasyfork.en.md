# Astro Empires Enhance

Adds battle report BBCode copying and analysis, AEBits imports, fleet data copying and arrival estimates to the **Borealis server** of Astro Empires. The script interface supports **Simplified Chinese and English**, and the analyzer accepts reports in both languages.

## Installation and first use

1. Install and enable Tampermonkey in your browser.
2. Install this script from its Greasy Fork page and confirm the installation in Tampermonkey.
3. Open or refresh [Borealis](https://borealis.astroempires.com/), choose “简体中文” or “English” in the initial language dialog, then click “保存 / Save”.

Choosing “稍后 / Later” or pressing Esc uses English for the current page and asks again on the next page load. The script currently runs only on Borealis.

## Bottom-right feature menu

Click the round up-arrow button in the bottom-right corner to open the feature menu.

- **Analyze BBCode**: paste a battle report and inspect technology results for both sides.
- **Settings**: select an interface language under “Display” and save to update the current page immediately. Cancel discards unsaved changes.
- **Help**: open a centered usage guide. Click “Close” or press Esc to return to the feature menu.

Closing the analysis panel or pressing Esc returns to the feature menu. Pressing Esc in the menu collapses it. Switching views or opening Settings or Help keeps your report input and analysis results until you leave the page.

## Copy battle report BBCode

On messages (`messages.aspx`), the guild board (`board.aspx`) and combat pages (`combat.aspx`), each complete battle report gets a “**Copy battle report BBCode**” button below it.

The button copies that report’s information, links, forces and outcome, keeping the source page’s language. If clipboard access fails, a text box appears so you can select and copy the content manually.

Use this BBCode for analysis to preserve the table structure when transferring a report.

## Analyze reports and import into AEBits

1. Open “Analyze BBCode” from the bottom-right menu.
2. Paste the report BBCode and click “Analyze”.
3. Review confirmed technology levels and the reasons listed under “Needs confirmation”.
4. Click “**Import into AEBits Battle Calculator**” to open the calculator in a new tab.

The analyzer accepts complete reports or just side headings and `[code]` unit tables. Keep all six columns: unit, initial quantity, final quantity, attack, armour and shield. Separate columns with Tabs or consecutive spaces.

Imports use each side’s **initial forces**, including fractional forces and units destroyed in battle. A report with only one side imports that side. Confirmed technologies and explicit bonuses are included, with game version set to 5. The calculator language follows your script language setting.

Technology inference depends on usable statistics and bonus information. Missing data, damaged base defenses or conflicting values may leave technologies unconfirmed. Those fields are omitted from the import and should be checked manually in the calculator. Reports containing only unit tables can still import valid forces, although some technologies may remain unknown.

Unknown units, invalid initial quantities or incomplete unit rows block the import and show an explanation. Editing the input clears the previous result; correct the report and analyze it again.

## Fleet details and combat tools

### Fleet details

Open a fleet details page with a valid fleet ID and available ships. The following buttons appear below the ship table.

- **Copy fleet data**: choose Simplified Chinese or English. Each line contains a unit name and quantity separated by a Tab, ready to paste into a spreadsheet or another tool.
- **AEBits Battle Calculator**: choose Attacker or Defender to import the ships into a new tab with game version 5. This page does not provide technology data, so enter technologies in the calculator.

### Combat pages

Combat pages with available forces provide the same copying and AEBits buttons.

- For copying, choose the attacker or defender and Simplified Chinese or English. Defender data includes the listed base defenses.
- AEBits imports both sides’ initial forces, confirmed technologies and listed bonuses. Fields requiring manual confirmation appear below the buttons.

The fleet copy language is independent of the script interface language. A manual-copy text box is also provided if copying fleet data fails.

## Fleet movement arrival estimates

On a fleet movement page (`fleet.aspx` with a valid `fleet` ID and `view=move`), choose a destination and set ships and speed. Once the game calculates travel time, “**Estimated arrival**” appears below the travel table. It updates every second to show when the fleet would arrive if it departed now.

- **Server time**: calculated from the game’s header server clock and displayed in GMT+1. It shows “Unavailable” if a valid clock cannot be read.
- **Local time**: calculated independently from your device’s current clock and displayed in your device’s time zone, including the daylight saving offset at arrival.

Invalid travel times clear the previous estimates. This feature displays predictions only and does not launch the fleet.

## Data and external resources

- Your language setting is saved in the browser’s storage for Borealis. If saving fails, the selected language still applies to the current page and a message explains the failure.
- Report conversion and analysis run in the current page. The script does not save pasted reports to browser storage; the input is not retained after leaving the page.
- Clicking an AEBits import sends forces, confirmed technologies and bonuses to AEBits through the URL parameters of the new tab.
- The script loads Vue from jsDelivr through `@require` and the Material Icons font from Google Fonts. If the font fails to load, the menu button remains usable with fallback arrow and close symbols.

## Links

- [Project source and feedback](https://github.com/simonkq1/AstroEmpires-Enhance)
- [AEBits English Battle Calculator](https://aebits.win/en/aeBattleCalc)
- [AEBits Chinese Battle Calculator](https://aebits.win/zh/aeBattleCalc)
