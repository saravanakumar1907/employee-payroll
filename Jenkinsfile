
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out Employee Payroll source code'
                checkout scm
            }
        }

        stage('Verify Project Files') {
            steps {
                sh '''
                    set -eu
                    test -f docker-compose.yml -o -f compose.yml
                    test -d frontend
                    test -d backend
                    echo "Project files verified."
                '''
            }
        }

        stage('Build and Deploy') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'payroll-deploy-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        set -eu

                        echo "Deploying application on EC2..."
                        ssh \
                            -i "$SSH_KEY" \
                            -o IdentitiesOnly=yes \
                            -o BatchMode=yes \
                            -o StrictHostKeyChecking=yes \
                            -o UserKnownHostsFile="$HOME/.ssh/known_hosts" \
                            "$SSH_USER@172.17.0.1"
                    '''
                }
            }
        }

        stage('Test API') {
            steps {
                sh '''
                    set -eu
                    echo "Checking Employee Payroll API..."

                    curl --fail --silent --show-error \
                        --retry 5 \
                        --retry-delay 2 \
                        http://16.4.140.3:3000/api/employees

                    echo
                    echo "API test passed."
                '''
            }
        }
    }

    post {
        success {
            echo 'Employee Payroll CI/CD pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Review the console output.'
        }
    }
}
