from sqlmodel import SQLModel


class ErrorDetail(SQLModel):
    code: str
    msg: str


class ErrorResponse(SQLModel):
    detail: ErrorDetail
