"""
OpenTelemetry tracing configuration for distributed tracing.
"""

from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME


def setup_tracing(app, service_name: str = "fraud-detection-backend"):
    """
    Configure OpenTelemetry tracing for the FastAPI application.

    Args:
        app: FastAPI application instance
        service_name: Name of the service for tracing
    """
    # Create resource with service name
    resource = Resource(attributes={SERVICE_NAME: service_name})

    # Configure tracer provider
    tracer_provider = TracerProvider(resource=resource)

    # Configure OTLP exporter (sends to Jaeger via OTLP)
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://jaeger:4317", insecure=True  # Jaeger OTLP endpoint
    )

    # Add span processor
    tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

    # Set global tracer provider
    trace.set_tracer_provider(tracer_provider)

    # Instrument FastAPI
    FastAPIInstrumentor.instrument_app(app)

    return tracer_provider


def get_tracer(name: str = __name__):
    """Get a tracer instance for manual instrumentation."""
    return trace.get_tracer(name)
