# HomeChef Kubernetes Deployment

This directory contains Kubernetes manifests and Helm charts for deploying the HomeChef microservices platform.

## Architecture

The platform consists of four main microservices:

- **Chef Service** (Port 8080): Chef management, menu, orders, analytics
- **Database Service** (Port 8081): PostgreSQL, Redis, WebSocket hub
- **Address Service** (Port 8082): Address management, geolocation, validation
- **Admin Service** (Port 8083): Administrative dashboard and management

## Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured to access your cluster
- Helm 3.x installed
- NGINX Ingress Controller (recommended)
- cert-manager for TLS certificates (optional)

## Quick Deployment

### Using the Deployment Script

```bash
# Deploy everything
./k8s/scripts/deploy.sh

# Check status
./k8s/scripts/deploy.sh status

# Cleanup
./k8s/scripts/deploy.sh cleanup
```

### Manual Deployment with Helm

```bash
# Add required Helm repositories
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Create namespace and apply manifests
kubectl apply -f k8s/manifests/namespace.yaml
kubectl apply -f k8s/manifests/rbac.yaml
kubectl apply -f k8s/manifests/secrets.yaml

# Deploy with Helm
helm install homechef ./k8s/helm-charts/homechef-microservices \
  --namespace homechef \
  --create-namespace \
  --wait
```

## Configuration

### Environment-specific Values

Create environment-specific values files:

```bash
# Production
helm install homechef ./k8s/helm-charts/homechef-microservices \
  --namespace homechef \
  --values ./k8s/helm-charts/homechef-microservices/values-prod.yaml

# Staging
helm install homechef ./k8s/helm-charts/homechef-microservices \
  --namespace homechef \
  --values ./k8s/helm-charts/homechef-microservices/values-staging.yaml
```

### Key Configuration Options

```yaml
# Enable/disable services
chefService:
  enabled: true
  replicaCount: 2

# Resource limits
common:
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10

# Database configuration
postgresql:
  enabled: true
  auth:
    database: "homechef_db"
    username: "homechef"
    password: "secure-password"

# Ingress configuration
chefService:
  ingress:
    enabled: true
    hosts:
      - host: api.homechef.com
        paths:
          - path: /v1/chefs
            pathType: Prefix
```

## Security

### TLS Certificates

Replace the default certificates with valid ones:

```bash
# Create TLS secret with your certificates
kubectl create secret tls homechef-tls-certs \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key \
  --namespace homechef

# For admin service
kubectl create secret tls homechef-admin-tls-certs \
  --cert=path/to/admin-tls.crt \
  --key=path/to/admin-tls.key \
  --namespace homechef
```

### JWT Secret

Update the JWT secret:

```bash
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Update the secret
kubectl create secret generic homechef-jwt-secret \
  --from-literal=jwt-secret="$JWT_SECRET" \
  --namespace homechef \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Network Policies

Network policies are enabled by default to restrict inter-pod communication:

```yaml
networkPolicy:
  enabled: true
  ingress:
    enabled: true
  egress:
    enabled: true
```

## Monitoring

### Health Checks

All services include health check endpoints:

```bash
# Check service health
kubectl get pods -n homechef
kubectl describe pod <pod-name> -n homechef
```

### Logs

View service logs:

```bash
# All services
kubectl logs -f -l app.kubernetes.io/instance=homechef -n homechef

# Specific service
kubectl logs -f deployment/homechef-chef-service -n homechef
```

### Metrics

If monitoring is enabled, metrics are available via:

- Prometheus: Service discovery and metrics collection
- Grafana: Dashboards and visualization

## Scaling

### Manual Scaling

```bash
# Scale a specific service
kubectl scale deployment homechef-chef-service --replicas=5 -n homechef
```

### Horizontal Pod Autoscaler

HPA is configured to scale based on CPU and memory usage:

```bash
# Check HPA status
kubectl get hpa -n homechef

# Describe HPA
kubectl describe hpa homechef-chef-service -n homechef
```

## Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pod <pod-name> -n homechef
   kubectl logs <pod-name> -n homechef
   ```

2. **Database connection issues**:
   ```bash
   # Check PostgreSQL status
   kubectl get pods -l app.kubernetes.io/name=postgresql -n homechef
   
   # Check database connectivity
   kubectl exec -it deployment/homechef-database-service -n homechef -- /bin/sh
   ```

3. **Ingress not working**:
   ```bash
   # Check ingress status
   kubectl get ingress -n homechef
   kubectl describe ingress homechef-chef-service -n homechef
   
   # Check ingress controller
   kubectl get pods -n ingress-nginx
   ```

### Debug Commands

```bash
# Port forward for local testing
kubectl port-forward -n homechef svc/homechef-chef-service 8080:8080

# Execute commands in pods
kubectl exec -it deployment/homechef-chef-service -n homechef -- /bin/sh

# Check resource usage
kubectl top pods -n homechef
kubectl top nodes
```

## Backup and Recovery

### Database Backup

```bash
# Create a backup job
kubectl create job --from=cronjob/postgresql-backup manual-backup -n homechef

# Check backup status
kubectl get jobs -n homechef
```

### Configuration Backup

```bash
# Backup all configurations
kubectl get all,configmap,secret,ingress,pvc -n homechef -o yaml > homechef-backup.yaml
```

## CI/CD Integration

### GitOps with ArgoCD

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: homechef
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/homechef-microservices
    targetRevision: HEAD
    path: k8s/helm-charts/homechef-microservices
  destination:
    server: https://kubernetes.default.svc
    namespace: homechef
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### GitHub Actions

```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install homechef ./k8s/helm-charts/homechef-microservices \
            --namespace homechef \
            --set image.tag=${{ github.sha }}
```

## Performance Tuning

### Resource Optimization

```yaml
# Adjust based on your workload
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Database Tuning

```yaml
postgresql:
  primary:
    resources:
      requests:
        cpu: 250m
        memory: 256Mi
      limits:
        cpu: 1000m
        memory: 1Gi
    configuration: |
      max_connections = 200
      shared_buffers = 256MB
      effective_cache_size = 1GB
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review pod logs and events
3. Consult the individual service documentation
4. Open an issue in the project repository

## License

MIT License - see the main project LICENSE file for details.