from typing import Any, Optional, TypeVar, Generic
from pydantic import BaseModel, Field, ConfigDict

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    status: bool = Field(..., description="True if the request was successful, false otherwise.")
    code: int = Field(..., description="A status code for the response. 0 for success, non-zero for errors.")
    message: str = Field(..., description="A human-readable message describing the response.")
    data: Optional[T] = Field(None, description="The actual data returned by the API, if any.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": True,
                "code": 0,
                "message": "Operation successful",
                "data": {"id": "123", "name": "Example"}
            }
        }
    )
