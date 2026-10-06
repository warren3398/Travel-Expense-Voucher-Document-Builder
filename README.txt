BSWM TEV Automation Website v0.1

HOW TO OPEN
1. Extract this ZIP.
2. Double-click index.html.
3. The website works locally in a modern browser.

INCLUDED IN THIS FIRST WORKING PROTOTYPE
- Approved TO upload + shared travel fields
- Online itinerary with automatic total
- DV Front fields and required dropdowns
- DV Back
- ORS dynamic fields
- CNRR input
- Accomplishment Report input + photo selection
- Folder naming: DESTINATION_DATE_AMOUNT
- Simple document naming convention
- Browser-local save and JSON backup

IMPORTANT
The editable Excel template-population/export backend is not yet connected in this browser-only prototype.
The uploaded Excel templates remain the basis for the next build, where the generated package will contain editable .xlsx files preserving the official layouts.

v0.4 CHANGES
- Payee/Employee is sourced from uploaded TO; multiple detected names appear in a dropdown.
- TO Number, Travel Start, Purpose, and Destination are designed as TO-extracted/read-only fields.
- Fund Cluster now automatically maps Responsibility Center, MFO/PAP (PREXC), and UACS:
  STO-REG-ALMED -> 15-03-01-03 | 200000-10000-1000 | 50201010-00
  STO-SEM-ALMED -> 15-03-04-03 | 200000-10000-1000 | 50201010-00
  STO-FMHFWCROP-ALMED -> 15-05-01-03 | 200000-10000-9000 | 50201010-00
  LFPA-NSHP-ALMED -> 22-01-01-03 | 310500-20003-2000 | 50201010-00
- CNRR changed to a simpler form/table: Date, Particulars/Expense, Amount, auto total.
- Text-based PDF TO extraction is included. Scanned/image TO OCR still requires the next build.

v0.6
- TO auto-detection updated specifically for the supplied BSWM Travel Order layout.
- Reads NAMES section and creates employee dropdown when multiple names are found.
- Extracts Departure Date as Travel Start, Destination, and Specific purpose of the trip.
- Detects TO number from document text or filename such as 2026-07-11246_signed.pdf.
- Adds OCR fallback for scanned PDF/JPG/PNG TOs (requires internet access to load browser OCR libraries).

v0.7 FIX
- Fixed TO number detection for filenames such as 2026-07-11246_signed.pdf.
- Added a parser that does not depend on PDF line breaks.
- BSWM labels now read from flattened text: Departure Date, Return Date, Destination, Specific purpose of the trip.
- Employee extraction targets the NAMES-to-Official Station section and known position titles.

v0.8 DISPLAY FIX
- CSS and website JavaScript are embedded directly in the HTML.
- This fixes the plain/unformatted display when local style.css/app.js are not loaded.
- Extract the ZIP first, then open OPEN_TEV_WEBSITE.html.

v0.9 ACTUAL TO FIX
Tested against the actual uploaded 2026-07-11246_signed.pdf.
The PDF contains only the digital-signature certificate as machine-readable text; the Travel Order itself is an image.
Therefore v0.9 forces OCR unless the extracted PDF text contains Departure Date, Destination and Specific purpose.
The OCR parser is tuned to the BSWM Travel Order labels and Control No. layout.
Internet access is required when opening locally because the browser loads PDF.js/Tesseract OCR libraries from CDN.
