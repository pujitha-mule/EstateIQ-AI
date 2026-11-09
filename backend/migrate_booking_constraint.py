import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "estateiq.db"

def migrate():
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found: {DB_PATH}")

    connection = sqlite3.connect(DB_PATH)

    try:
        connection.execute("PRAGMA foreign_keys = OFF")
        connection.execute("BEGIN")

        connection.execute("""
            CREATE TABLE bookings_new (
                id INTEGER PRIMARY KEY,
                lead_id INTEGER NOT NULL REFERENCES leads(id),
                project_id INTEGER NOT NULL REFERENCES projects(id),
                executive_id INTEGER REFERENCES users(id),
                slot_id INTEGER REFERENCES visit_slots(id),
                slot_start DATETIME NOT NULL,
                slot_end DATETIME NOT NULL,
                status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
                notes TEXT,
                created_at DATETIME NOT NULL
            )
        """)

        connection.execute("""
            INSERT INTO bookings_new
            (id, lead_id, project_id, executive_id, slot_id,
             slot_start, slot_end, status, notes, created_at)
            SELECT id, lead_id, project_id, executive_id, slot_id,
                   slot_start, slot_end, status, notes, created_at
            FROM bookings
        """)

        connection.execute("DROP TABLE bookings")
        connection.execute("ALTER TABLE bookings_new RENAME TO bookings")

        connection.execute(
            "CREATE INDEX IF NOT EXISTS ix_booking_lead ON bookings(lead_id)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS ix_booking_slot_status ON bookings(slot_id, status)"
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS ix_booking_project_start ON bookings(project_id, slot_start)"
        )

        connection.commit()
        print("Migration completed successfully.")

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.close()


if __name__ == "__main__":
    migrate()