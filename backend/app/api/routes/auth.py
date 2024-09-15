from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import CurrentUserDependency, SessionDependency, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import Message, NewPassword, Token, UserPublic
from app.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)

# Contains all routes related to the user authentication in the system
router = APIRouter()


@router.post("/login/access-token")
def login_access_token(
    session: SessionDependency, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    """
    Logs an user by email and password. The return is a OAuth2 token.

    The returned token can be used by further requests, store it safely.
    """
    user = crud.authenticate(
        session=session, 
        email=form_data.username, 
        password=form_data.password
    )

    print('INSIDE ACCESS-TOKEN')
    print(form_data.username)
    print(form_data.password)
    print(user)

    # Purposely not explaining if the credentials are incorrect or if the user does not exist.
    if (not user) or (not user.is_active):
        raise HTTPException(
            status_code=400, 
            detail="The provided email or password are incorrect. Please verify your credentials"
        )

    expires_in = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, 
            time_to_expire=expires_in
        )
    )


@router.post("/login/test-token", response_model=UserPublic)
def test_token(user: CurrentUserDependency) -> Any:
    """
    Verifies if the access token is valid
    """
    return user


@router.post("/password-recovery/{email}")
def recover_password(email: str, session: SessionDependency) -> Message:
    """
    Password Recovery
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find an user with this email in the system",
        )

    token = generate_password_reset_token(email=email)
    email_content = generate_reset_password_email(
        email_to=user.email, email=email, token=token
    )
    send_email(
        email_to=user.email,
        subject=email_content.subject,
        html_content=email_content.html_content,
    )
    return Message(message="An email was sent to you containing instructions for a password reset")


@router.post("/reset-password/")
def reset_password(session: SessionDependency, body: NewPassword) -> Message:
    """
    Resets the password of an User.

    The password must be validated with a valid password reset token (see /password-recovery)
    """
    email = verify_password_reset_token(token=body.token)

    if not email:
        raise HTTPException(
            status_code=400, 
            detail="The provided token is missing or could not be validated."
        )

    user = crud.get_user_by_email(session=session, email=email)

    if (not user) or (not user.is_active):
        raise HTTPException(
            status_code=404,
            detail="We couldn't find an user with this email in the system",
        )

    user.hashed_password = get_password_hash(password=body.new_password)
    session.add(user)
    session.commit()
    return Message(message="Password reset successfully")


@router.post(
    "/password-recovery-html-content/{email}",
    dependencies=[Depends(get_current_active_superuser)],
    response_class=HTMLResponse,
)
def recover_password_html_content(email: str, session: SessionDependency) -> Any:
    """
    Assembles the email for Password Recovery, returning it in HTML format.
    """
    user = crud.get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="We couldn't find an user with this email in the system",
        )
    token = generate_password_reset_token(email=email)
    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=token
    )

    return HTMLResponse(
        content=email_data.html_content, 
        headers={"subject:": email_data.subject}
    )
