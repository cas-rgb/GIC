import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import sqlite3
import json
import os
from datetime import datetime

# Configuration
SERVICE_ACCOUNT_PATH = 'service-account.json'
DATABASE_NAME = 'gic_intelligence.db'

def initialize_firebase():
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        print(f"Error: {SERVICE_ACCOUNT_PATH} not found.")
        print("Please place your Firebase Service Account JSON file in the root directory.")
        return None
    
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    return firestore.client()

def flatten_document(doc_dict):
    """Deeply flattens a dictionary, primarily for handling the 'payload' field."""
    flat_doc = {}
    for key, value in doc_dict.items():
        if key == 'payload' and isinstance(value, dict):
            for p_key, p_value in value.items():
                flat_doc[f'payload_{p_key}'] = p_value
        elif isinstance(value, datetime):
            flat_doc[key] = value.isoformat()
        elif isinstance(value, (dict, list)):
            flat_doc[key] = json.dumps(value)
        else:
            flat_doc[key] = value
    return flat_doc

def sync_collection(db, collection_name, sqlite_conn):
    print(f"Syncing collection: {collection_name}...")
    docs = db.collection(collection_name).stream()
    
    data = []
    for doc in docs:
        doc_dict = doc.to_dict()
        doc_dict['id'] = doc.id
        data.append(flatten_document(doc_dict))
    
    if not data:
        print(f"No data found in {collection_name}")
        return

    df = pd.DataFrame(data)
    # Sanitize column names for SQL
    df.columns = [c.replace(' ', '_').replace('-', '_').lower() for c in df.columns]
    
    df.to_sql(collection_name, sqlite_conn, if_exists='replace', index=False)
    print(f"Successfully synced {len(data)} documents to table '{collection_name}'")

def main():
    db = initialize_firebase()
    if not db:
        return

    conn = sqlite3.connect(DATABASE_NAME)
    
    # Sync core GIC collections
    collections = ['riskSignals', 'communities', 'strategicDatasets', 'tenders']
    
    for collection in collections:
        try:
            sync_collection(db, collection, conn)
        except Exception as e:
            print(f"Failed to sync {collection}: {e}")
    
    conn.close()
    print(f"\nSuccess! Database '{DATABASE_NAME}' is ready for Apache Superset.")

if __name__ == "__main__":
    main()
