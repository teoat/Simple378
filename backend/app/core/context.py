from contextvars import ContextVar
from datetime import datetime

# Error monitoring context using ContextVars for async safety
class RequestContext:
    """Store request context using ContextVars for async safety"""
    _request_id: ContextVar[str] = ContextVar("request_id", default=None)
    _user_id: ContextVar[str] = ContextVar("user_id", default=None)
    _method: ContextVar[str] = ContextVar("method", default=None)
    _path: ContextVar[str] = ContextVar("path", default=None)
    _timestamp: ContextVar[datetime] = ContextVar("timestamp", default=None)

    @property
    def request_id(self) -> str:
        return self._request_id.get()
    
    @request_id.setter
    def request_id(self, value: str):
        self._request_id.set(value)

    @property
    def method(self) -> str:
        return self._method.get()
    
    @method.setter
    def method(self, value: str):
        self._method.set(value)

    @property
    def path(self) -> str:
        return self._path.get()
    
    @path.setter
    def path(self, value: str):
        self._path.set(value)

    @property
    def timestamp(self) -> datetime:
        return self._timestamp.get()
    
    @timestamp.setter
    def timestamp(self, value: datetime):
        self._timestamp.set(value)

request_context = RequestContext()
