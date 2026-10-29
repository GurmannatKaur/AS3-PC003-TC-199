# Database migrations

SQLite tables are created from SQLAlchemy metadata at application startup. For production
schema evolution, initialize Alembic here and write reviewed migrations before changing
persisted columns. No migration framework is required to run the local demo.
