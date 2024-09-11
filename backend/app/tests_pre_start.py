import logging

from sqlalchemy import Engine
from sqlmodel import Session, select
from tenacity import after_log, before_log, retry, stop_after_attempt, wait_fixed

from app.core.db import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# For testing, we use the same logic that backend_pre_start.py

time_to_wait = 1
attempt_threshold = 180


@retry(
    stop=stop_after_attempt(attempt_threshold),
    wait=wait_fixed(time_to_wait),
    before=before_log(logger, logging.INFO),
    after=after_log(logger, logging.WARN),
)
def init(engine: Engine) -> None:
    try:
        with Session(engine) as session:
            session.exec(select(1))
    except Exception as e:
        logger.error(e)
        raise e


def main() -> None:
    logger.info("Service initializing...")
    init(engine)
    logger.info("Service up and running!")


if __name__ == "__main__":
    main()





