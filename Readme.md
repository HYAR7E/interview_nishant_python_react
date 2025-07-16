# Determine Location and Confidence Level of Cellphone Carrier Report

Scenario:

- Provide a list of time periods and whether the state the person was in was a Tower Jump or not, and the associated confidence level
- Given a set of data points with longitude, latitude, timestamp, and current state
- When the data points are processed
- Then a .csv report should be provided with a list of time periods
- And the state where the person was located during that interval
- And if the state was a tower jump or not (yes/no)
- And the confidence level expressed as a percentage
- No records should be deleted from the output file

## Checklist

- [x] Determine state or country by day time intervals
- [x] Implement tower jump handler
- [x] Determine level of confidence
- [x] Implement react frontend

## App Description

Backend in Flask that saves mobile carrier report, processes it to add the confidence stat and serves and endpoint to fetch location in date range.

Processed file can be found in `app/files/{filename}_processed.csv`, no records deleted.

Frontend in react + vite + typescript + tailwindcss, saves file in api and fetches location data from datetime range.
