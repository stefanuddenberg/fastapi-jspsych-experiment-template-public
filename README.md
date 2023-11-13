# fastapi-jspsych-experiment-template
Simple generic experiment template using FastAPI, SQLModel, and jspsych.

# Instructions
## Set the environment variables
Can be done online using Railway.

## Attach a Postgres database add-on
Can be done online using Railway.


## Set up with railway
`railway login`
`railway link` (choosing the appropriate project)
`railway shell`
`railway run python cli.py reset_db`

## Export data
`railway run python cli.py export`

## Notes

- The current setup has a one-to-one relationship between participants and data. However, if a participant should run the experiment multiple times, their data will still be saved -- it just means that the participant table will only be associated with the latest version of the data. This is a design choice that can be changed by modifying the `Participant` and `Data` models in `models.py`.