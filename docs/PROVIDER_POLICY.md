# Discovery provider policy

DIAL treats station directories as replaceable evidence sources rather than product identity.

A provider adapter must:

- normalize results into DIAL's canonical station model
- bound result count
- reject unusable stream URLs for the production HTTPS context
- expose provider identity in the station record
- fail without damaging saved presets or the built-in catalogue

Radio Browser is the first adapter under this policy.
