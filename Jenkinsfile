pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
        DOCKER_IMAGE = 'deku013/webapp'
        DOCKER_TAG = "build-${env.BUILD_NUMBER}"
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
                    docker logout
                    """
                }
            }
        }
        
        stage('Update K8s Deployment') {
            steps {
                script {
                    sh """
                    # Update the image tag in deployment.yaml
                    sed -i 's|image: deku013/webapp:__IMAGE_TAG__|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g' k8s-deployment.yaml
                    
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
                    withCredentials([file(credentialsId: 'k3s-config-remote.yaml', variable: 'KUBECONFIG_FILE')]) {
                        sh """
                        export KUBECONFIG=${KUBECONFIG_FILE}
                        echo "=== Applying Kubernetes manifests ==="
                        kubectl apply -f k8s-deployment.yaml
                        
                        echo "=== Waiting for deployment rollout ==="
                        kubectl rollout status deployment/webapp-deployment --timeout=300s
                        """
                    }
                }
            }
        }
        
        stage('Smoke Test') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'k3s-config-remote.yaml', variable: 'KUBECONFIG_FILE')]) {
                        sh """
                        export KUBECONFIG=${KUBECONFIG_FILE}
                        echo "=== Waiting for pods to be ready ==="
                        sleep 30
                        
                        echo "=== Pods Status ==="
                        kubectl get pods -o wide -l app=webapp
                        
                        echo "=== Services Status ==="
                        kubectl get services -l app=webapp
                        
                        echo "=== Deployment Status ==="
                        kubectl get deployment webapp-deployment -o wide
                        
                        echo "=== Testing application ==="
                        # Get the service and test if it's accessible
                        kubectl get svc webapp-service
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                currentBuild.description = "Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
        success {
            script {
                emailext (
                    subject: "SUCCESS: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                    body: """
                    Pipeline completed successfully!
                    
                    Application: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Docker Image: ${DOCKER_IMAGE}:${DOCKER_TAG}
                    Build URL: ${env.BUILD_URL}
                    
                    The application has been deployed to Kubernetes.
                    """,
                    to: "jhaa98676@gmail.com"
                )
            }
        }
        failure {
            script {
                emailext (
                    subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                    body: """
                    Pipeline failed!
                    
                    Application: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                    Build URL: ${env.BUILD_URL}
                    
                    Please check Jenkins logs for details.
                    """,
                    to: "jhaa98676@gmail.com"
                )
            }
        }
    }
}
