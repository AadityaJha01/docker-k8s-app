pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        KUBECONFIG = credentials('kubeconfig')
        DOCKER_IMAGE = 'deku013/webapp'
        DOCKER_TAG = "build-${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/AadityaJha01/docker-k8s-app.git'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    sh """
                    echo \"${DOCKERHUB_CREDENTIALS_PSW}\" | docker login -u \"${DOCKERHUB_CREDENTIALS_USR}\" --password-stdin
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Update K8s Deployment') {
            steps {
                script {
                    sh """
                    # Update the image tag in deployment.yaml
                    sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g' k8s-deployment.yaml
                    
                    # Verify the change
                    echo "=== Updated k8s-deployment.yaml ==="
                    grep -n "image:" k8s-deployment.yaml
                    """
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh """
                    echo "=== Applying Kubernetes manifests ==="
                    kubectl apply -f k8s-deployment.yaml
                    
                    echo "=== Waiting for deployment rollout ==="
                    kubectl rollout status deployment/webapp-deployment --timeout=300s
                    """
                }
            }
        }
        
        stage('Smoke Test') {
            steps {
                script {
                    sh """
                    echo "=== Waiting for pods to be ready ==="
                    sleep 30
                    
                    echo "=== Pods Status ==="
                    kubectl get pods -o wide -l app=webapp
                    
                    echo "=== Services Status ==="
                    kubectl get services
                    
                    echo "=== Deployment Status ==="
                    kubectl get deployment webapp-deployment
                    
                    echo "=== Checking pod logs ==="
                    kubectl logs -l app=webapp --tail=10
                    """
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout || true'
            cleanWs()
            
            // Save deployment information
            script {
                currentBuild.description = "Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
        success {
            emailext (
                subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                Pipeline completed successfully!
                
                Application: ${env.JOB_NAME}
                Build Number: ${env.BUILD_NUMBER}
                Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                Build URL: ${env.BUILD_URL}
                
                Deployment Status:
                - $(kubectl get deployment webapp-deployment -o jsonpath='{.status.availableReplicas}')/$(kubectl get deployment webapp-deployment -o jsonpath='{.status.replicas}') pods available
                """,
                to: "jhaa98676@gmail.com"
            )
        }
        failure {
            emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                Pipeline failed!
                
                Application: ${env.JOB_NAME}
                Build Number: ${env.BUILD_NUMBER}
                Build URL: ${env.BUILD_URL}
                
                Please check the Jenkins logs for details.
                """,
                to: "jhaa98676@gmail.com"
            )
        }
    }
}