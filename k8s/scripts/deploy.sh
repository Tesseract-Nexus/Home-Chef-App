#!/bin/bash

# HomeChef Microservices Deployment Script
set -e

# Configuration
NAMESPACE="homechef"
HELM_RELEASE="homechef"
CHART_PATH="./k8s/helm-charts/homechef-microservices"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace..."
    kubectl apply -f k8s/manifests/namespace.yaml
    log_success "Namespace created/updated"
}

# Setup RBAC
setup_rbac() {
    log_info "Setting up RBAC..."
    kubectl apply -f k8s/manifests/rbac.yaml
    log_success "RBAC configured"
}

# Setup secrets
setup_secrets() {
    log_info "Setting up secrets..."
    
    # Check if secrets already exist
    if kubectl get secret homechef-tls-certs -n $NAMESPACE &> /dev/null; then
        log_warning "TLS secrets already exist, skipping creation"
    else
        log_info "Creating TLS secrets..."
        kubectl apply -f k8s/manifests/secrets.yaml
    fi
    
    log_success "Secrets configured"
}

# Add Helm repositories
add_helm_repos() {
    log_info "Adding Helm repositories..."
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo update
    log_success "Helm repositories added"
}

# Deploy with Helm
deploy_helm() {
    log_info "Deploying HomeChef microservices with Helm..."
    
    # Check if release exists
    if helm list -n $NAMESPACE | grep -q $HELM_RELEASE; then
        log_info "Upgrading existing release..."
        helm upgrade $HELM_RELEASE $CHART_PATH \
            --namespace $NAMESPACE \
            --timeout 10m \
            --wait
    else
        log_info "Installing new release..."
        helm install $HELM_RELEASE $CHART_PATH \
            --namespace $NAMESPACE \
            --create-namespace \
            --timeout 10m \
            --wait
    fi
    
    log_success "Helm deployment completed"
}

# Wait for deployments
wait_for_deployments() {
    log_info "Waiting for deployments to be ready..."
    
    deployments=(
        "homechef-chef-service"
        "homechef-database-service"
        "homechef-address-service"
        "homechef-admin-service"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Waiting for $deployment..."
        kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n $NAMESPACE
    done
    
    log_success "All deployments are ready"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo
    
    log_info "Pods:"
    kubectl get pods -n $NAMESPACE
    echo
    
    log_info "Services:"
    kubectl get services -n $NAMESPACE
    echo
    
    log_info "Ingresses:"
    kubectl get ingress -n $NAMESPACE
    echo
    
    log_info "HPA (if enabled):"
    kubectl get hpa -n $NAMESPACE 2>/dev/null || log_warning "No HPA found"
    echo
}

# Get service URLs
get_service_urls() {
    log_info "Service URLs:"
    
    # Get ingress IPs/hostnames
    INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    INGRESS_HOSTNAME=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [ "$INGRESS_IP" != "pending" ] && [ "$INGRESS_IP" != "" ]; then
        echo "  API Base URL: https://$INGRESS_IP"
        echo "  Chef API: https://$INGRESS_IP/v1/chefs"
        echo "  Address API: https://$INGRESS_IP/v1/addresses"
        echo "  Database API: https://$INGRESS_IP/v1/database"
        echo "  WebSocket: wss://$INGRESS_IP/ws"
    elif [ "$INGRESS_HOSTNAME" != "" ]; then
        echo "  API Base URL: https://$INGRESS_HOSTNAME"
        echo "  Chef API: https://$INGRESS_HOSTNAME/v1/chefs"
        echo "  Address API: https://$INGRESS_HOSTNAME/v1/addresses"
        echo "  Database API: https://$INGRESS_HOSTNAME/v1/database"
        echo "  WebSocket: wss://$INGRESS_HOSTNAME/ws"
    else
        log_warning "Ingress IP/hostname not yet available"
        echo "  Use 'kubectl get ingress -n $NAMESPACE' to check status"
    fi
    
    # Port forwarding instructions
    echo
    log_info "For local development, you can use port forwarding:"
    echo "  kubectl port-forward -n $NAMESPACE svc/homechef-chef-service 8080:8080"
    echo "  kubectl port-forward -n $NAMESPACE svc/homechef-database-service 8081:8081"
    echo "  kubectl port-forward -n $NAMESPACE svc/homechef-address-service 8082:8082"
    echo "  kubectl port-forward -n $NAMESPACE svc/homechef-admin-service 8083:8083"
}

# Main deployment function
main() {
    log_info "Starting HomeChef microservices deployment..."
    
    check_prerequisites
    create_namespace
    setup_rbac
    setup_secrets
    add_helm_repos
    deploy_helm
    wait_for_deployments
    show_status
    get_service_urls
    
    log_success "Deployment completed successfully!"
    echo
    log_info "Next steps:"
    echo "  1. Update DNS records to point to the ingress IP/hostname"
    echo "  2. Replace default TLS certificates with valid ones"
    echo "  3. Configure monitoring and alerting"
    echo "  4. Set up CI/CD pipelines for automated deployments"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        get_service_urls
        ;;
    "cleanup")
        log_info "Cleaning up deployment..."
        helm uninstall $HELM_RELEASE -n $NAMESPACE || true
        kubectl delete namespace $NAMESPACE || true
        log_success "Cleanup completed"
        ;;
    "help")
        echo "Usage: $0 [deploy|status|cleanup|help]"
        echo "  deploy  - Deploy the microservices (default)"
        echo "  status  - Show deployment status"
        echo "  cleanup - Remove all resources"
        echo "  help    - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac