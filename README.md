# Dockerized Web App with Kubernetes CI/CD Pipeline

A simple web application demonstrating CI/CD pipeline using:
- Docker 🐳
- Kubernetes ☸️
- Jenkins ⚙️
- AWS EC2/EKS ☁️

## Architecture

1. **Web Application**: Simple HTML/CSS/JS app
2. **Docker**: Containerization
3. **Kubernetes**: Orchestration
4. **Jenkins**: CI/CD Automation
5. **AWS**: Cloud Infrastructure

## Local Development

```bash
# Build Docker image
docker build -t webapp .

# Run container
docker run -p 8080:80 webapp

# Access application
open http://localhost:8080