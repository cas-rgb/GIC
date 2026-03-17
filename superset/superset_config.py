# Superset Configuration for GIC Platform
import os

FEATURE_FLAGS = {
    "EMBEDDED_DASHBOARD": True,
}

# Allow SQLite for production usage in this local bridge context
PREVENT_UNSAFE_DB_CONNECTIONS = False

# Enable CSV Uploads
CSV_EXTENSIONS = {"csv", "tsv", "txt"}
UPLOADED_PATH = "/app/superset_home/uploads"
