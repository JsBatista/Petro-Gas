import logging

from sqlmodel import Session

from app.core.db import engine, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    with Session(engine) as session:
        init_db(session) # Creates admin user


def main() -> None:
    logger.info("Populating initial data...")
    init()
    logger.info("Initial data polulated!")


if __name__ == "__main__":
    main()
