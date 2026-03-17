begin;

truncate table fact_source_reliability_daily;
truncate table fact_service_pressure_daily;
truncate table service_incidents cascade;
truncate table signals cascade;
truncate table documents cascade;
truncate table locations cascade;

insert into locations (
  id, country, province, district, municipality, ward, lat, lng, location_key
) values
  ('11000000-0000-0000-0000-000000000001', 'South Africa', 'Gauteng', null, 'City of Johannesburg', 'Ward 58', -26.204103, 28.047305, 'South Africa|Gauteng||City of Johannesburg|Ward 58'),
  ('11000000-0000-0000-0000-000000000002', 'South Africa', 'Gauteng', null, 'City of Tshwane', 'Ward 77', -25.746111, 28.188056, 'South Africa|Gauteng||City of Tshwane|Ward 77'),
  ('11000000-0000-0000-0000-000000000003', 'South Africa', 'Western Cape', null, 'City of Cape Town', 'Ward 13', -33.924870, 18.424055, 'South Africa|Western Cape||City of Cape Town|Ward 13'),
  ('11000000-0000-0000-0000-000000000004', 'South Africa', 'Western Cape', null, 'Drakenstein', 'Ward 6', -33.734200, 18.962000, 'South Africa|Western Cape||Drakenstein|Ward 6'),
  ('11000000-0000-0000-0000-000000000005', 'South Africa', 'KwaZulu-Natal', null, 'eThekwini', 'Ward 34', -29.858700, 31.021800, 'South Africa|KwaZulu-Natal||eThekwini|Ward 34'),
  ('11000000-0000-0000-0000-000000000006', 'South Africa', 'KwaZulu-Natal', null, 'Msunduzi', 'Ward 28', -29.600600, 30.379400, 'South Africa|KwaZulu-Natal||Msunduzi|Ward 28'),
  ('11000000-0000-0000-0000-000000000007', 'South Africa', 'Eastern Cape', null, 'Nelson Mandela Bay', 'Ward 4', -33.960800, 25.602200, 'South Africa|Eastern Cape||Nelson Mandela Bay|Ward 4'),
  ('11000000-0000-0000-0000-000000000008', 'South Africa', 'Eastern Cape', null, 'Buffalo City', 'Ward 31', -32.978300, 27.855600, 'South Africa|Eastern Cape||Buffalo City|Ward 31'),
  ('11000000-0000-0000-0000-000000000009', 'South Africa', 'Limpopo', null, 'Polokwane', 'Ward 19', -23.904500, 29.468900, 'South Africa|Limpopo||Polokwane|Ward 19'),
  ('11000000-0000-0000-0000-000000000010', 'South Africa', 'Limpopo', null, 'Thulamela', 'Ward 14', -22.975300, 30.454500, 'South Africa|Limpopo||Thulamela|Ward 14'),
  ('11000000-0000-0000-0000-000000000011', 'South Africa', 'Mpumalanga', null, 'Mbombela', 'Ward 22', -25.465800, 30.985300, 'South Africa|Mpumalanga||Mbombela|Ward 22'),
  ('11000000-0000-0000-0000-000000000012', 'South Africa', 'Mpumalanga', null, 'Emalahleni', 'Ward 10', -25.871300, 29.233200, 'South Africa|Mpumalanga||Emalahleni|Ward 10'),
  ('11000000-0000-0000-0000-000000000013', 'South Africa', 'North West', null, 'Rustenburg', 'Ward 16', -25.667600, 27.242100, 'South Africa|North West||Rustenburg|Ward 16'),
  ('11000000-0000-0000-0000-000000000014', 'South Africa', 'North West', null, 'Mahikeng', 'Ward 9', -25.865200, 25.644200, 'South Africa|North West||Mahikeng|Ward 9'),
  ('11000000-0000-0000-0000-000000000015', 'South Africa', 'Free State', null, 'Mangaung', 'Ward 46', -29.118300, 26.214000, 'South Africa|Free State||Mangaung|Ward 46'),
  ('11000000-0000-0000-0000-000000000016', 'South Africa', 'Free State', null, 'Matjhabeng', 'Ward 20', -27.976700, 26.735100, 'South Africa|Free State||Matjhabeng|Ward 20'),
  ('11000000-0000-0000-0000-000000000017', 'South Africa', 'Northern Cape', null, 'Sol Plaatje', 'Ward 8', -28.741900, 24.770700, 'South Africa|Northern Cape||Sol Plaatje|Ward 8'),
  ('11000000-0000-0000-0000-000000000018', 'South Africa', 'Northern Cape', null, 'Dikgatlong', 'Ward 3', -28.045300, 24.524800, 'South Africa|Northern Cape||Dikgatlong|Ward 3');

insert into documents (
  id, source_id, location_id, external_id, url, title, published_at, fetched_at, doc_type,
  language, content_text, content_hash, parser_version, status, created_at
) values
  ('21000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'prov-demo-1', 'https://example.org/prov-demo-1', 'Johannesburg water outages intensify community anger', current_timestamp - interval '10 days', current_timestamp - interval '10 days', 'article', 'en', 'Recurring water outages in Johannesburg triggered complaints, frustration, and protest threats from residents.', 'prov-demo-hash-1', 'seed-v2', 'active', current_timestamp - interval '10 days'),
  ('21000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000002', 'prov-demo-2', 'https://example.org/prov-demo-2', 'Tshwane repair teams reduce some pressure after backlog', current_timestamp - interval '4 days', current_timestamp - interval '4 days', 'article', 'en', 'Repair teams in Tshwane restored partial service after a maintenance backlog, easing some resident complaints.', 'prov-demo-hash-2', 'seed-v2', 'active', current_timestamp - interval '4 days'),
  ('21000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000003', 'prov-demo-3', 'https://example.org/prov-demo-3', 'Cape Town transport disruption and road complaints rise', current_timestamp - interval '9 days', current_timestamp - interval '9 days', 'article', 'en', 'Road damage and transport disruption in Cape Town caused repeated public complaints and commuter frustration.', 'prov-demo-hash-3', 'seed-v2', 'active', current_timestamp - interval '9 days'),
  ('21000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000004', 'prov-demo-4', 'https://example.org/prov-demo-4', 'Drakenstein waste delays prompt visible municipal response', current_timestamp - interval '3 days', current_timestamp - interval '3 days', 'article', 'en', 'Waste collection delays in Drakenstein led to complaints, but municipal teams were dispatched to restore service.', 'prov-demo-hash-4', 'seed-v2', 'active', current_timestamp - interval '3 days'),
  ('21000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000005', 'prov-demo-5', 'https://example.org/prov-demo-5', 'eThekwini sewer overflow pressure builds in key wards', current_timestamp - interval '8 days', current_timestamp - interval '8 days', 'article', 'en', 'Sewer overflow in eThekwini caused sanitation pressure, anger, and local organizing by residents.', 'prov-demo-hash-5', 'seed-v2', 'active', current_timestamp - interval '8 days'),
  ('21000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000006', 'prov-demo-6', 'https://example.org/prov-demo-6', 'Msunduzi clinic strain draws escalating concern', current_timestamp - interval '2 days', current_timestamp - interval '2 days', 'article', 'en', 'Clinic capacity strain in Msunduzi increased complaints about long waits and poor response.', 'prov-demo-hash-6', 'seed-v2', 'active', current_timestamp - interval '2 days'),
  ('21000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000007', 'prov-demo-7', 'https://example.org/prov-demo-7', 'Nelson Mandela Bay electricity interruptions trigger protests', current_timestamp - interval '7 days', current_timestamp - interval '7 days', 'article', 'en', 'Electricity interruptions in Nelson Mandela Bay prompted visible protests and public distrust.', 'prov-demo-hash-7', 'seed-v2', 'active', current_timestamp - interval '7 days'),
  ('21000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000008', 'prov-demo-8', 'https://example.org/prov-demo-8', 'Buffalo City water repairs improve response coverage', current_timestamp - interval '1 day', current_timestamp - interval '1 day', 'article', 'en', 'Water repairs in Buffalo City restored service in some areas and improved response visibility.', 'prov-demo-hash-8', 'seed-v2', 'active', current_timestamp - interval '1 day'),
  ('21000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000009', 'prov-demo-9', 'https://example.org/prov-demo-9', 'Polokwane road damage remains unresolved', current_timestamp - interval '8 days', current_timestamp - interval '8 days', 'article', 'en', 'Road damage in Polokwane remained unresolved and residents continued lodging complaints.', 'prov-demo-hash-9', 'seed-v2', 'active', current_timestamp - interval '8 days'),
  ('21000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000010', 'prov-demo-10', 'https://example.org/prov-demo-10', 'Thulamela water tanker response eases some pressure', current_timestamp - interval '2 days', current_timestamp - interval '2 days', 'article', 'en', 'Water tanker support in Thulamela reduced some pressure, though service disruption remained serious.', 'prov-demo-hash-10', 'seed-v2', 'active', current_timestamp - interval '2 days'),
  ('21000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000011', 'prov-demo-11', 'https://example.org/prov-demo-11', 'Mbombela structural safety concerns intensify', current_timestamp - interval '6 days', current_timestamp - interval '6 days', 'article', 'en', 'Structural safety concerns around a public facility in Mbombela increased fear and pressure on local authorities.', 'prov-demo-hash-11', 'seed-v2', 'active', current_timestamp - interval '6 days'),
  ('21000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000012', 'prov-demo-12', 'https://example.org/prov-demo-12', 'Emalahleni electricity complaints rise despite partial response', current_timestamp - interval '3 days', current_timestamp - interval '3 days', 'article', 'en', 'Electricity complaints in Emalahleni continued despite partial technical response from the municipality.', 'prov-demo-hash-12', 'seed-v2', 'active', current_timestamp - interval '3 days'),
  ('21000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000013', 'prov-demo-13', 'https://example.org/prov-demo-13', 'Rustenburg sewer failures create sustained public frustration', current_timestamp - interval '7 days', current_timestamp - interval '7 days', 'article', 'en', 'Sewer failures in Rustenburg caused persistent sanitation pressure and community frustration.', 'prov-demo-hash-13', 'seed-v2', 'active', current_timestamp - interval '7 days'),
  ('21000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000014', 'prov-demo-14', 'https://example.org/prov-demo-14', 'Mahikeng road repairs reduce protest risk slightly', current_timestamp - interval '2 days', current_timestamp - interval '2 days', 'article', 'en', 'Road repair activity in Mahikeng reduced some protest risk and improved public response coverage.', 'prov-demo-hash-14', 'seed-v2', 'active', current_timestamp - interval '2 days'),
  ('21000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000015', 'prov-demo-15', 'https://example.org/prov-demo-15', 'Mangaung waste and water complaints spread across wards', current_timestamp - interval '5 days', current_timestamp - interval '5 days', 'article', 'en', 'Waste and water service complaints spread across Mangaung, deepening dissatisfaction.', 'prov-demo-hash-15', 'seed-v2', 'active', current_timestamp - interval '5 days'),
  ('21000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000016', 'prov-demo-16', 'https://example.org/prov-demo-16', 'Matjhabeng clinic backlog remains a pressure point', current_timestamp - interval '1 day', current_timestamp - interval '1 day', 'article', 'en', 'Clinic backlog in Matjhabeng remained a pressure point with little visible response.', 'prov-demo-hash-16', 'seed-v2', 'active', current_timestamp - interval '1 day'),
  ('21000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000017', 'prov-demo-17', 'https://example.org/prov-demo-17', 'Sol Plaatje water interruption sparks complaints', current_timestamp - interval '4 days', current_timestamp - interval '4 days', 'article', 'en', 'Water interruption in Sol Plaatje sparked citizen complaints and urgency for intervention.', 'prov-demo-hash-17', 'seed-v2', 'active', current_timestamp - interval '4 days'),
  ('21000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000018', 'prov-demo-18', 'https://example.org/prov-demo-18', 'Dikgatlong transport disruption still unresolved', current_timestamp - interval '1 day', current_timestamp - interval '1 day', 'article', 'en', 'Transport disruption in Dikgatlong remained unresolved and community pressure continued to rise.', 'prov-demo-hash-18', 'seed-v2', 'active', current_timestamp - interval '1 day');

insert into signals (
  id, document_id, location_id, sector, signal_type, sentiment, severity_score, urgency_score,
  confidence_score, event_date, summary_text, source_url, status, created_at
) values
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Civil', 'water_outage', 'negative', 86, 88, 0.88, current_timestamp - interval '10 days', 'Water outages intensified community anger in Johannesburg.', 'https://example.org/prov-demo-1', 'active', current_timestamp - interval '10 days'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'Civil', 'water_repair_update', 'neutral', 44, 46, 0.74, current_timestamp - interval '4 days', 'Tshwane repair response eased some service pressure.', 'https://example.org/prov-demo-2', 'active', current_timestamp - interval '4 days'),
  ('31000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'Roads', 'road_damage', 'negative', 73, 70, 0.81, current_timestamp - interval '9 days', 'Road disruption in Cape Town increased commuter frustration.', 'https://example.org/prov-demo-3', 'active', current_timestamp - interval '9 days'),
  ('31000000-0000-0000-0000-000000000004', '21000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000004', 'Civil', 'waste_collection_delay', 'negative', 55, 50, 0.73, current_timestamp - interval '3 days', 'Waste delays in Drakenstein drew complaints but response teams were visible.', 'https://example.org/prov-demo-4', 'active', current_timestamp - interval '3 days'),
  ('31000000-0000-0000-0000-000000000005', '21000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000005', 'Civil', 'sewer_overflow', 'negative', 83, 84, 0.86, current_timestamp - interval '8 days', 'Sewer overflow in eThekwini caused sanitation pressure and anger.', 'https://example.org/prov-demo-5', 'active', current_timestamp - interval '8 days'),
  ('31000000-0000-0000-0000-000000000006', '21000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000006', 'Health', 'facility_pressure', 'negative', 66, 68, 0.78, current_timestamp - interval '2 days', 'Clinic strain in Msunduzi increased concern over access.', 'https://example.org/prov-demo-6', 'active', current_timestamp - interval '2 days'),
  ('31000000-0000-0000-0000-000000000007', '21000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000007', 'Apex', 'power_interruptions', 'negative', 84, 82, 0.85, current_timestamp - interval '7 days', 'Electricity interruptions in Nelson Mandela Bay triggered protests.', 'https://example.org/prov-demo-7', 'active', current_timestamp - interval '7 days'),
  ('31000000-0000-0000-0000-000000000008', '21000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000008', 'Civil', 'water_repair_update', 'neutral', 42, 40, 0.72, current_timestamp - interval '1 day', 'Buffalo City repairs improved response visibility.', 'https://example.org/prov-demo-8', 'active', current_timestamp - interval '1 day'),
  ('31000000-0000-0000-0000-000000000009', '21000000-0000-0000-0000-000000000009', '11000000-0000-0000-0000-000000000009', 'Roads', 'road_damage', 'negative', 69, 65, 0.77, current_timestamp - interval '8 days', 'Polokwane road failures remained unresolved.', 'https://example.org/prov-demo-9', 'active', current_timestamp - interval '8 days'),
  ('31000000-0000-0000-0000-000000000010', '21000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000010', 'Civil', 'water_outage', 'negative', 61, 59, 0.75, current_timestamp - interval '2 days', 'Thulamela water tanker relief reduced some pressure.', 'https://example.org/prov-demo-10', 'active', current_timestamp - interval '2 days'),
  ('31000000-0000-0000-0000-000000000011', '21000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000011', 'Structural', 'structural_risk', 'negative', 80, 77, 0.83, current_timestamp - interval '6 days', 'Structural safety concerns intensified in Mbombela.', 'https://example.org/prov-demo-11', 'active', current_timestamp - interval '6 days'),
  ('31000000-0000-0000-0000-000000000012', '21000000-0000-0000-0000-000000000012', '11000000-0000-0000-0000-000000000012', 'Apex', 'power_interruptions', 'negative', 71, 67, 0.79, current_timestamp - interval '3 days', 'Electricity complaints in Emalahleni persisted despite partial response.', 'https://example.org/prov-demo-12', 'active', current_timestamp - interval '3 days'),
  ('31000000-0000-0000-0000-000000000013', '21000000-0000-0000-0000-000000000013', '11000000-0000-0000-0000-000000000013', 'Civil', 'sewer_overflow', 'negative', 78, 74, 0.82, current_timestamp - interval '7 days', 'Rustenburg sewer failures sustained public frustration.', 'https://example.org/prov-demo-13', 'active', current_timestamp - interval '7 days'),
  ('31000000-0000-0000-0000-000000000014', '21000000-0000-0000-0000-000000000014', '11000000-0000-0000-0000-000000000014', 'Roads', 'road_repair_update', 'neutral', 43, 38, 0.70, current_timestamp - interval '2 days', 'Road repair activity in Mahikeng reduced protest risk slightly.', 'https://example.org/prov-demo-14', 'active', current_timestamp - interval '2 days'),
  ('31000000-0000-0000-0000-000000000015', '21000000-0000-0000-0000-000000000015', '11000000-0000-0000-0000-000000000015', 'Civil', 'service_backlog', 'negative', 76, 79, 0.82, current_timestamp - interval '5 days', 'Mangaung service complaints spread across wards.', 'https://example.org/prov-demo-15', 'active', current_timestamp - interval '5 days'),
  ('31000000-0000-0000-0000-000000000016', '21000000-0000-0000-0000-000000000016', '11000000-0000-0000-0000-000000000016', 'Health', 'facility_pressure', 'negative', 64, 66, 0.76, current_timestamp - interval '1 day', 'Matjhabeng clinic backlog remained a pressure point.', 'https://example.org/prov-demo-16', 'active', current_timestamp - interval '1 day'),
  ('31000000-0000-0000-0000-000000000017', '21000000-0000-0000-0000-000000000017', '11000000-0000-0000-0000-000000000017', 'Civil', 'water_outage', 'negative', 67, 69, 0.78, current_timestamp - interval '4 days', 'Water interruption in Sol Plaatje sparked complaints.', 'https://example.org/prov-demo-17', 'active', current_timestamp - interval '4 days'),
  ('31000000-0000-0000-0000-000000000018', '21000000-0000-0000-0000-000000000018', '11000000-0000-0000-0000-000000000018', 'Roads', 'transport_disruption', 'negative', 72, 71, 0.80, current_timestamp - interval '1 day', 'Transport disruption in Dikgatlong remained unresolved.', 'https://example.org/prov-demo-18', 'active', current_timestamp - interval '1 day');

insert into service_incidents (
  id, signal_id, location_id, service_domain, incident_type, failure_indicator, citizen_pressure_indicator,
  protest_indicator, response_indicator, recurrence_indicator, severity, classification_confidence,
  opened_at, closed_at, created_at
) values
  ('41000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Water Infrastructure', 'water_outage', true, true, true, false, true, 'High', 0.88, current_timestamp - interval '10 days', null, current_timestamp - interval '10 days'),
  ('41000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000002', 'Water Infrastructure', 'water_repair_update', false, true, false, true, false, 'Low', 0.74, current_timestamp - interval '4 days', current_timestamp - interval '3 days', current_timestamp - interval '4 days'),
  ('41000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'Roads and Transport', 'road_damage', true, true, false, false, true, 'Medium', 0.81, current_timestamp - interval '9 days', null, current_timestamp - interval '9 days'),
  ('41000000-0000-0000-0000-000000000004', '31000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000004', 'Waste Management', 'waste_collection_delay', true, true, false, true, false, 'Medium', 0.73, current_timestamp - interval '3 days', null, current_timestamp - interval '3 days'),
  ('41000000-0000-0000-0000-000000000005', '31000000-0000-0000-0000-000000000005', '11000000-0000-0000-0000-000000000005', 'Water Infrastructure', 'sewer_overflow', true, true, true, false, true, 'High', 0.86, current_timestamp - interval '8 days', null, current_timestamp - interval '8 days'),
  ('41000000-0000-0000-0000-000000000006', '31000000-0000-0000-0000-000000000006', '11000000-0000-0000-0000-000000000006', 'Healthcare', 'facility_pressure', true, true, false, false, false, 'Medium', 0.78, current_timestamp - interval '2 days', null, current_timestamp - interval '2 days'),
  ('41000000-0000-0000-0000-000000000007', '31000000-0000-0000-0000-000000000007', '11000000-0000-0000-0000-000000000007', 'Electricity Supply', 'power_interruptions', true, true, true, false, true, 'High', 0.85, current_timestamp - interval '7 days', null, current_timestamp - interval '7 days'),
  ('41000000-0000-0000-0000-000000000008', '31000000-0000-0000-0000-000000000008', '11000000-0000-0000-0000-000000000008', 'Water Infrastructure', 'water_repair_update', false, true, false, true, false, 'Low', 0.72, current_timestamp - interval '1 day', current_timestamp, current_timestamp - interval '1 day'),
  ('41000000-0000-0000-0000-000000000009', '31000000-0000-0000-0000-000000000009', '11000000-0000-0000-0000-000000000009', 'Roads and Transport', 'road_damage', true, true, false, false, true, 'Medium', 0.77, current_timestamp - interval '8 days', null, current_timestamp - interval '8 days'),
  ('41000000-0000-0000-0000-000000000010', '31000000-0000-0000-0000-000000000010', '11000000-0000-0000-0000-000000000010', 'Water Infrastructure', 'water_outage', true, true, false, true, false, 'Medium', 0.75, current_timestamp - interval '2 days', null, current_timestamp - interval '2 days'),
  ('41000000-0000-0000-0000-000000000011', '31000000-0000-0000-0000-000000000011', '11000000-0000-0000-0000-000000000011', 'Provincial Infrastructure', 'structural_risk', true, true, false, false, true, 'High', 0.83, current_timestamp - interval '6 days', null, current_timestamp - interval '6 days'),
  ('41000000-0000-0000-0000-000000000012', '31000000-0000-0000-0000-000000000012', '11000000-0000-0000-0000-000000000012', 'Electricity Supply', 'power_interruptions', true, true, false, true, false, 'Medium', 0.79, current_timestamp - interval '3 days', null, current_timestamp - interval '3 days'),
  ('41000000-0000-0000-0000-000000000013', '31000000-0000-0000-0000-000000000013', '11000000-0000-0000-0000-000000000013', 'Water Infrastructure', 'sewer_overflow', true, true, false, false, true, 'High', 0.82, current_timestamp - interval '7 days', null, current_timestamp - interval '7 days'),
  ('41000000-0000-0000-0000-000000000014', '31000000-0000-0000-0000-000000000014', '11000000-0000-0000-0000-000000000014', 'Roads and Transport', 'road_repair_update', false, true, false, true, false, 'Low', 0.70, current_timestamp - interval '2 days', current_timestamp - interval '1 day', current_timestamp - interval '2 days'),
  ('41000000-0000-0000-0000-000000000015', '31000000-0000-0000-0000-000000000015', '11000000-0000-0000-0000-000000000015', 'Water Infrastructure', 'service_backlog', true, true, false, false, true, 'High', 0.82, current_timestamp - interval '5 days', null, current_timestamp - interval '5 days'),
  ('41000000-0000-0000-0000-000000000016', '31000000-0000-0000-0000-000000000016', '11000000-0000-0000-0000-000000000016', 'Healthcare', 'facility_pressure', true, true, false, false, false, 'Medium', 0.76, current_timestamp - interval '1 day', null, current_timestamp - interval '1 day'),
  ('41000000-0000-0000-0000-000000000017', '31000000-0000-0000-0000-000000000017', '11000000-0000-0000-0000-000000000017', 'Water Infrastructure', 'water_outage', true, true, false, false, false, 'Medium', 0.78, current_timestamp - interval '4 days', null, current_timestamp - interval '4 days'),
  ('41000000-0000-0000-0000-000000000018', '31000000-0000-0000-0000-000000000018', '11000000-0000-0000-0000-000000000018', 'Roads and Transport', 'transport_disruption', true, true, false, false, true, 'Medium', 0.80, current_timestamp - interval '1 day', null, current_timestamp - interval '1 day');

insert into fact_service_pressure_daily (
  day,
  province,
  municipality,
  service_domain,
  pressure_case_count,
  high_severity_count,
  protest_count,
  response_count,
  avg_classification_confidence,
  source_document_count
)
select
  coalesce(date(si.opened_at), date(s.created_at)) as day,
  l.province,
  l.municipality,
  si.service_domain,
  count(*) as pressure_case_count,
  count(*) filter (where si.severity = 'High') as high_severity_count,
  count(*) filter (where si.protest_indicator = true) as protest_count,
  count(*) filter (where si.response_indicator = true) as response_count,
  round(avg(si.classification_confidence)::numeric, 3) as avg_classification_confidence,
  count(distinct s.document_id) as source_document_count
from service_incidents si
join signals s on s.id = si.signal_id
left join locations l on l.id = coalesce(si.location_id, s.location_id)
where si.citizen_pressure_indicator = true
  and si.failure_indicator = true
group by 1, 2, 3, 4;

insert into fact_source_reliability_daily (
  day,
  province,
  source_type,
  source_count,
  avg_reliability_score,
  document_count
)
select
  coalesce(date(d.published_at), date(d.created_at)) as day,
  l.province,
  src.source_type,
  count(distinct src.id) as source_count,
  round(avg(src.reliability_score)::numeric, 3) as avg_reliability_score,
  count(distinct d.id) as document_count
from documents d
join sources src on src.id = d.source_id
left join locations l on l.id = d.location_id
where d.status = 'active'
  and l.province is not null
group by 1, 2, 3;

commit;
