Drop structured historical infrastructure and budget source files here.

Expected files:

- `budget_allocations.csv`
- `province_infrastructure_history.csv`
- `municipality_infrastructure_history.csv`
- `ward_infrastructure_history.csv`
- `historical_issue_events.csv`

Recommended columns:

- budget allocations:
  - `geography_level,province_name,municipality_name,ward_name,issue_family,service_domain,period_year,budget_amount,project_name,project_status,summary_text,source_name,source_url,verification_tier`
- infrastructure history:
  - province: `province_name,issue_family,service_domain,event_date,period_year,severity,summary_text,source_name,source_url,verification_tier`
  - municipality: `province_name,municipality_name,issue_family,service_domain,event_date,period_year,severity,summary_text,source_name,source_url,verification_tier`
  - ward: `province_name,municipality_name,ward_name,issue_family,service_domain,event_date,period_year,severity,summary_text,source_name,source_url,verification_tier`
- historical issue events:
  - `geography_level,province_name,municipality_name,ward_name,issue_family,service_domain,event_date,period_year,severity,summary_text,source_name,source_url,verification_tier`
