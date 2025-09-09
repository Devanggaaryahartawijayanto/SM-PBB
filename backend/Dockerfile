# Use Python 3.12 slim image
FROM python:3.12

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Set work directory
WORKDIR /app

# Copy uv configuration files
COPY pyproject.toml uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Create non-root user
RUN adduser --disabled-password --gecos '' --uid 1001 appuser
RUN chown -R appuser:appuser /app
USER appuser

# Command to run the application
CMD ["uv", "run", "fastapi", "dev", "--host", "0.0.0.0", "--port", "8000"]